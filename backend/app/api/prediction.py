import os
import tempfile
import threading
import time
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pennylane as qml
import shap
import xgboost as xgb
from fastapi import APIRouter, HTTPException
from pennylane import numpy as pnp
from pydantic import BaseModel, Field
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import MinMaxScaler, StandardScaler

from app.services.explainability_service import (
    evaluate_model,
    explain_patient,
    fuse_risk,
    render_uploaded_patient_plots,
)

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

MODEL_DIR = Path(__file__).resolve().parents[2] / "model_cache"
try:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    MODEL_DIR = Path(tempfile.gettempdir()) / "magi_models"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Bump when the preprocessing or circuit changes, so stale caches are retrained
CACHE_VERSION = "v2"
XGB_MODEL_PATH = str(MODEL_DIR / f"xgb_pca_model_{CACHE_VERSION}.json")
VQC_WEIGHTS_PATH = str(MODEL_DIR / f"vqc_weights_{CACHE_VERSION}.npy")
PCA_PATH = str(MODEL_DIR / f"pca_{CACHE_VERSION}.joblib")
SCALER_PATH = str(MODEL_DIR / f"scaler_{CACHE_VERSION}.joblib")

N_QUBITS = 4
NUM_LAYERS = 3
EPOCHS = 10
BATCH_SIZE = 16
LEARNING_RATE = 0.05
SEED = 67

SHAP_BACKGROUND_CLUSTERS = 10
SHAP_GLOBAL_SAMPLES = 60
MAX_PATIENTS = 200

# KernelExplainer keeps per-call state on the instance, so concurrent requests
# sharing one explainer corrupt each other; run SHAP one request at a time
_shap_lock = threading.Lock()

FEATURE_NAMES = load_breast_cancer().feature_names.tolist()

dev = qml.device("default.qubit", wires=N_QUBITS)


@qml.qnode(dev)
def vqc_circuit(weights, features):
    for i in range(N_QUBITS):
        qml.RY(features[i], wires=i)
    # RX-only BasicEntanglerLayers scored below chance (~37%); general Rot
    # gates with ring entanglement reach ~92% on the held-out split
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return qml.expval(qml.PauliZ(0))


class ModelBundle:
    def __init__(self):
        self.xgb_model: xgb.XGBClassifier | None = None
        # StandardScaler + PCA, so large-unit features (area) don't swamp PCA
        self.pca: Pipeline | None = None
        self.scaler: MinMaxScaler | None = None
        self.vqc_weights = None
        self.metrics = {}
        self.benchmark = {}
        self.x_train_scaled = None
        self.x_test_scaled = None
        self._global_quantum_shap = None
        self.component_labels: list[str] = []
        self._explainers = None
        self._explainer_lock = threading.Lock()
        self._train_lock = threading.Lock()
        self._ready = False

    def train_or_load(self):
        if self._ready:
            return
        # Startup warm-up and the first request can race; train only once
        with self._train_lock:
            if not self._ready:
                self._train_or_load()

    def _train_or_load(self):
        data = load_breast_cancer()
        x_raw, y_raw = data.data, data.target
        y_clean = np.where(y_raw == 0, 1, 0)

        x_train_raw, x_test_raw, y_train, y_test = train_test_split(
            x_raw, y_clean, test_size=0.20, random_state=67, stratify=y_clean
        )

        if os.path.exists(PCA_PATH) and os.path.exists(SCALER_PATH):
            self.pca = joblib.load(PCA_PATH)
            self.scaler = joblib.load(SCALER_PATH)
        else:
            self.pca = make_pipeline(
                StandardScaler(), PCA(n_components=N_QUBITS, random_state=SEED)
            )
            x_train_pca_fit = self.pca.fit_transform(x_train_raw)
            self.scaler = MinMaxScaler(feature_range=(0, np.pi))
            self.scaler.fit(x_train_pca_fit)
            joblib.dump(self.pca, PCA_PATH)
            joblib.dump(self.scaler, SCALER_PATH)

        x_train_pca = self.pca.transform(x_train_raw)
        x_test_pca = self.pca.transform(x_test_raw)
        x_train_scaled = self.scaler.transform(x_train_pca)
        x_test_scaled = self.scaler.transform(x_test_pca)
        self.x_train_scaled = x_train_scaled
        self.x_test_scaled = x_test_scaled
        # Name each qubit's principal component after its heaviest-loading biomarker
        self.component_labels = [
            f"PC{i + 1} · {FEATURE_NAMES[int(np.argmax(np.abs(component)))]}"
            for i, component in enumerate(self.pca[-1].components_)
        ]

        if os.path.exists(XGB_MODEL_PATH):
            self.xgb_model = xgb.XGBClassifier()
            self.xgb_model.load_model(XGB_MODEL_PATH)
        else:
            self.xgb_model = xgb.XGBClassifier(eval_metric="logloss", random_state=67)
            self.xgb_model.fit(x_train_scaled, y_train)
            self.xgb_model.save_model(XGB_MODEL_PATH)

        xgb_preds = self.xgb_model.predict(x_test_scaled)
        xgb_probs = self.xgb_model.predict_proba(x_test_scaled)[:, 1]

        x_train_q = pnp.array(x_train_scaled, requires_grad=False)
        y_train_q = pnp.array(np.where(y_train == 0, -1.0, 1.0), requires_grad=False)
        y_test_q = np.where(y_test == 0, -1.0, 1.0)

        if os.path.exists(VQC_WEIGHTS_PATH):
            self.vqc_weights = pnp.array(np.load(VQC_WEIGHTS_PATH), requires_grad=True)
        else:
            # Seeded so every fresh clone trains the same model
            rng = np.random.default_rng(SEED)
            weights = pnp.array(
                rng.uniform(-0.1, 0.1, size=(NUM_LAYERS, N_QUBITS, 3)), requires_grad=True
            )
            optimizer = qml.AdamOptimizer(stepsize=LEARNING_RATE)

            def loss_fn(w, x_batch, y_batch):
                # Broadcast the batch through the circuit in one call (~10x faster)
                return pnp.mean((vqc_circuit(w, x_batch.T) - y_batch) ** 2)

            for epoch in range(EPOCHS):
                indices = rng.permutation(len(x_train_q))
                x_shuf, y_shuf = x_train_q[indices], y_train_q[indices]
                for i in range(0, len(x_train_q), BATCH_SIZE):
                    x_batch = x_shuf[i:i + BATCH_SIZE]
                    y_batch = y_shuf[i:i + BATCH_SIZE]
                    weights = optimizer.step(
                        loss_fn, weights, x_batch=x_batch, y_batch=y_batch
                    )

            self.vqc_weights = weights
            np.save(VQC_WEIGHTS_PATH, np.array(weights))

        q_raw_scores = self.quantum_scores(x_test_scaled)
        q_binary_preds = [1.0 if s > 0 else -1.0 for s in q_raw_scores]

        self.metrics = {
            "classical": {
                "accuracy": round(float(accuracy_score(y_test, xgb_preds)), 3),
                "recall": round(float(recall_score(y_test, xgb_preds)), 3),
                "roc_auc": round(float(roc_auc_score(y_test, xgb_probs)), 3),
            },
            "quantum": {
                "accuracy": round(float(accuracy_score(y_test_q, q_binary_preds)), 3),
                "recall": round(float(recall_score(y_test_q, q_binary_preds)), 3),
                "roc_auc": round(float(roc_auc_score(y_test_q, q_raw_scores)), 3),
            },
        }
        # Same test split, scored the way /explain scores patients (malignant = 1)
        t0 = time.time()
        xgb_test_probs = self.classical_probabilities(x_test_scaled)
        xgb_time = time.time() - t0
        t0 = time.time()
        vqc_test_scores = self.quantum_scores(x_test_scaled)
        vqc_time = time.time() - t0
        self.benchmark = {
            "classical": evaluate_model(y_test, xgb_test_probs, 0.5, xgb_time),
            "quantum": evaluate_model(y_test, vqc_test_scores, 0.0, vqc_time),
        }
        self._ready = True

    def predict_classical(self, features_scaled: np.ndarray):
        pred = int(self.xgb_model.predict(features_scaled)[0])
        prob = float(self.xgb_model.predict_proba(features_scaled)[0][1])
        return pred, prob

    def predict_quantum(self, features_scaled: np.ndarray):
        score = float(vqc_circuit(self.vqc_weights, features_scaled[0]))
        pred = 1 if score > 0 else 0
        return pred, score

    def quantum_scores(self, rows: np.ndarray) -> np.ndarray:
        # Broadcast all rows through the circuit at once; > 0 means malignant
        features = np.atleast_2d(np.asarray(rows, dtype=float)).T
        return np.atleast_1d(np.asarray(vqc_circuit(self.vqc_weights, features), dtype=float))

    def classical_probabilities(self, rows: np.ndarray) -> np.ndarray:
        return self.xgb_model.predict_proba(np.atleast_2d(rows))[:, 1]

    def explainers(self):
        # Built once from the cached models, so uploaded patients can be
        # explained without running the training pipeline
        with self._explainer_lock:
            if self._explainers is None:
                background = shap.kmeans(
                    self.x_train_scaled,
                    min(SHAP_BACKGROUND_CLUSTERS, len(self.x_train_scaled)),
                )
                self._explainers = {
                    "classical": shap.KernelExplainer(self.classical_probabilities, background),
                    "quantum": shap.KernelExplainer(self.quantum_scores, background),
                }
            return self._explainers

    def to_model_space(self, features: np.ndarray) -> np.ndarray:
        return self.scaler.transform(self.pca.transform(features))


bundle = ModelBundle()


class PatientFeatures(BaseModel):
    features: List[float] = Field(..., min_length=30, max_length=30)


class PatientBatch(BaseModel):
    patients: List[List[float]] = Field(..., min_length=1, max_length=MAX_PATIENTS)


class PatientPlotRequest(PatientBatch):
    patient: int = Field(1, ge=1)


def _explain_batch(patients: List[List[float]]) -> dict:
    for idx, row in enumerate(patients):
        if len(row) != 30:
            raise HTTPException(
                status_code=400,
                detail=f"Patient {idx + 1} has {len(row)} features; exactly 30 are required",
            )

    try:
        bundle.train_or_load()
        x_scaled = bundle.to_model_space(np.array(patients, dtype=float))
        explainers = bundle.explainers()
        with _shap_lock:
            shap_values = {
                "quantum": np.atleast_2d(explainers["quantum"].shap_values(x_scaled, silent=True)),
                "classical": np.atleast_2d(explainers["classical"].shap_values(x_scaled, silent=True)),
            }
        return {
            "x_scaled": x_scaled,
            "classical_probs": bundle.classical_probabilities(x_scaled),
            "quantum_scores": bundle.quantum_scores(x_scaled),
            "shap": shap_values,
            "base_values": {
                model: float(np.ravel(explainer.expected_value)[0])
                for model, explainer in explainers.items()
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {str(e)}")


@router.get("/health")
def predict_health():
    return {"status": "ok", "model_ready": bundle._ready}


@router.get("/feature-names")
def feature_names():
    return {"features": FEATURE_NAMES}


@router.get("/metrics")
def metrics():
    bundle.train_or_load()
    return bundle.metrics


@router.post("/")
def predict(payload: PatientFeatures):
    if len(payload.features) != 30:
        raise HTTPException(status_code=400, detail="Exactly 30 features required")

    bundle.train_or_load()

    x = np.array(payload.features).reshape(1, -1)
    x_pca = bundle.pca.transform(x)
    x_scaled = bundle.scaler.transform(x_pca)

    classical_pred, classical_prob = bundle.predict_classical(x_scaled)
    quantum_pred, quantum_score = bundle.predict_quantum(x_scaled)

    return {
        "classical": {
            "prediction": "malignant" if classical_pred == 1 else "benign",
            "probability_malignant": round(classical_prob, 4),
        },
        "quantum": {
            "prediction": "malignant" if quantum_pred == 1 else "benign",
            "raw_score": round(quantum_score, 4),
        },
    }


@router.post("/explain")
def explain_patients(payload: PatientBatch):
    batch = _explain_batch(payload.patients)
    x_scaled = batch["x_scaled"]

    def contributions(values, row):
        return [
            {
                "feature": bundle.component_labels[i],
                "value": round(float(row[i]), 4),
                "shap_value": round(float(values[i]), 4),
            }
            for i in range(len(bundle.component_labels))
        ]

    results = []
    for idx in range(len(x_scaled)):
        prob = float(batch["classical_probs"][idx])
        score = float(batch["quantum_scores"][idx])
        results.append({
            "patient": idx + 1,
            "classical": {
                "prediction": "malignant" if prob > 0.5 else "benign",
                "probability_malignant": round(prob, 4),
                "features": contributions(batch["shap"]["classical"][idx], x_scaled[idx]),
            },
            "quantum": {
                "prediction": "malignant" if score > 0 else "benign",
                "raw_score": round(score, 4),
                "features": contributions(batch["shap"]["quantum"][idx], x_scaled[idx]),
            },
        })

    return {
        "status": "success",
        "explainer": "KernelExplainer",
        "feature_labels": bundle.component_labels,
        "base_values": {
            model: round(value, 4) for model, value in batch["base_values"].items()
        },
        "results": results,
    }


@router.post("/explain/plots")
def explain_patient_plots(payload: PatientPlotRequest):
    if payload.patient > len(payload.patients):
        raise HTTPException(status_code=400, detail=f"Patient {payload.patient} is not in the upload")

    idx = payload.patient - 1
    batch = _explain_batch([payload.patients[idx]])
    score = float(batch["quantum_scores"][0])

    try:
        # Model-level attribution over the held-out test patients, computed once
        X_global = bundle.x_test_scaled[:SHAP_GLOBAL_SAMPLES]
        with _shap_lock:
            if bundle._global_quantum_shap is None:
                bundle._global_quantum_shap = np.atleast_2d(
                    bundle.explainers()["quantum"].shap_values(X_global, silent=True)
                )
        plots = render_uploaded_patient_plots(
            bundle.component_labels,
            batch["shap"]["quantum"][0],
            score,
            bundle._global_quantum_shap,
            X_global,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP plot rendering failed: {str(e)}")

    return {
        "status": "success",
        "patient": payload.patient,
        "quantum_score": round(score, 3),
        "diagnosis": "Malignant" if score > 0 else "Benign",
        "base_value": round(batch["base_values"]["quantum"], 4),
        "fusion": fuse_risk(float(batch["classical_probs"][0]), score),
        "benchmark": bundle.benchmark,
        **plots,
    }


@router.get("/shap")
def get_shap_explanation(
    dataset_id: str,
    sample_type: str = "malignant",
    target_column: str | None = None,
):
    if sample_type not in {"malignant", "benign"}:
        raise HTTPException(status_code=400, detail="sample_type must be 'malignant' or 'benign'")

    try:
        return explain_patient(dataset_id, sample_type, target_column)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' was not found.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {str(e)}")
