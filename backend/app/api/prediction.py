import os
import tempfile
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pennylane as qml
import xgboost as xgb
from fastapi import APIRouter, HTTPException
from pennylane import numpy as pnp
from pydantic import BaseModel, Field
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

MODEL_DIR = Path(__file__).resolve().parents[2] / "model_cache"
try:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    MODEL_DIR = Path(tempfile.gettempdir()) / "magi_models"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

XGB_MODEL_PATH = str(MODEL_DIR / "xgb_pca_model.json")
VQC_WEIGHTS_PATH = str(MODEL_DIR / "vqc_weights.npy")
PCA_PATH = str(MODEL_DIR / "pca.joblib")
SCALER_PATH = str(MODEL_DIR / "scaler.joblib")

N_QUBITS = 4
NUM_LAYERS = 3
EPOCHS = 8
BATCH_SIZE = 16

FEATURE_NAMES = load_breast_cancer().feature_names.tolist()

dev = qml.device("default.qubit", wires=N_QUBITS)


@qml.qnode(dev)
def vqc_circuit(weights, features):
    for i in range(N_QUBITS):
        qml.RY(features[i], wires=i)
    qml.BasicEntanglerLayers(weights, wires=range(N_QUBITS))
    return qml.expval(qml.PauliZ(0))


class ModelBundle:
    def __init__(self):
        self.xgb_model: xgb.XGBClassifier | None = None
        self.pca: PCA | None = None
        self.scaler: MinMaxScaler | None = None
        self.vqc_weights = None
        self.metrics = {}
        self._ready = False

    def train_or_load(self):
        if self._ready:
            return

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
            self.pca = PCA(n_components=N_QUBITS, random_state=67)
            x_train_pca_fit = self.pca.fit_transform(x_train_raw)
            self.scaler = MinMaxScaler(feature_range=(0, np.pi))
            self.scaler.fit(x_train_pca_fit)
            joblib.dump(self.pca, PCA_PATH)
            joblib.dump(self.scaler, SCALER_PATH)

        x_train_pca = self.pca.transform(x_train_raw)
        x_test_pca = self.pca.transform(x_test_raw)
        x_train_scaled = self.scaler.transform(x_train_pca)
        x_test_scaled = self.scaler.transform(x_test_pca)

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
        x_test_q = pnp.array(x_test_scaled, requires_grad=False)
        y_train_q = pnp.array(np.where(y_train == 0, -1.0, 1.0), requires_grad=False)
        y_test_q = np.where(y_test == 0, -1.0, 1.0)

        if os.path.exists(VQC_WEIGHTS_PATH):
            self.vqc_weights = pnp.array(np.load(VQC_WEIGHTS_PATH), requires_grad=True)
        else:
            weights = pnp.random.uniform(
                low=0.0, high=2 * np.pi, size=(NUM_LAYERS, N_QUBITS), requires_grad=True
            )
            optimizer = qml.AdamOptimizer(stepsize=0.05)

            def loss_fn(w, x_batch, y_batch):
                predictions = [vqc_circuit(w, x) for x in x_batch]
                return pnp.mean((y_batch - predictions) ** 2)

            for epoch in range(EPOCHS):
                indices = np.random.permutation(len(x_train_q))
                x_shuf, y_shuf = x_train_q[indices], y_train_q[indices]
                for i in range(0, len(x_train_q), BATCH_SIZE):
                    x_batch = x_shuf[i:i + BATCH_SIZE]
                    y_batch = y_shuf[i:i + BATCH_SIZE]
                    weights = optimizer.step(
                        loss_fn, weights, x_batch=x_batch, y_batch=y_batch
                    )

            self.vqc_weights = weights
            np.save(VQC_WEIGHTS_PATH, np.array(weights))

        q_raw_scores = [vqc_circuit(self.vqc_weights, x) for x in x_test_q]
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
        self._ready = True

    def predict_classical(self, features_scaled: np.ndarray):
        pred = int(self.xgb_model.predict(features_scaled)[0])
        prob = float(self.xgb_model.predict_proba(features_scaled)[0][1])
        return pred, prob

    def predict_quantum(self, features_scaled: np.ndarray):
        score = float(vqc_circuit(self.vqc_weights, features_scaled[0]))
        pred = 1 if score > 0 else 0
        return pred, score


bundle = ModelBundle()


class PatientFeatures(BaseModel):
    features: List[float] = Field(..., min_length=30, max_length=30)


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


@router.get("/shap")
def get_shap_explanation(sample_type: str = "malignant"):
    try:
        import shap
        data = load_breast_cancer()
        X, y = data.data, np.where(data.target == 0, 1, 0)
        
        # Fit TreeExplainer on XGBoost
        model = xgb.XGBClassifier(n_estimators=100, max_depth=3, eval_metric="logloss", random_state=42)
        model.fit(X, y)
        explainer = shap.TreeExplainer(model)

        # Select target sample based on requested diagnosis type
        if sample_type == "benign":
            target_indices = np.where(y == 0)[0]
        else:
            target_indices = np.where(y == 1)[0]
            
        sample_idx = int(target_indices[0])
        shap_vals = explainer.shap_values(X[sample_idx:sample_idx+1])[0]
        base_val = float(explainer.expected_value)
        prob = float(model.predict_proba(X[sample_idx:sample_idx+1])[0][1])

        features_list = []
        for i, name in enumerate(data.feature_names):
            features_list.append({
                "feature": str(name),
                "value": round(float(X[sample_idx][i]), 4),
                "shap_value": round(float(shap_vals[i]), 4),
                "contribution": round(float(shap_vals[i]), 4),
            })

        # Sort by absolute impact
        features_list.sort(key=lambda item: abs(item["shap_value"]), reverse=True)

        return {
            "status": "success",
            "condition": "Wisconsin Breast Cancer (WDBC)",
            "sample_type": "Malignant" if sample_type == "malignant" else "Benign",
            "base_value": round(base_val, 4),
            "predicted_risk_probability": round(prob, 4),
            "risk_level": "High Risk" if prob >= 0.7 else "Moderate Risk" if prob >= 0.3 else "Low Risk",
            "top_features": features_list[:7],
            "all_features": features_list,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {str(e)}")