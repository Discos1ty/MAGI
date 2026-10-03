import base64
import io
import threading
import time

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import shap
from sklearn.metrics import confusion_matrix, roc_auc_score, roc_curve

from app.services.dataset_service import extract_and_encode_target, resolve_malignant_class
from app.services.dataset_store import load_dataset, load_dataset_metadata
from app.services.model_engine import ModelEngine
from app.services.preprocessing_service import PreprocessingPipeline


MALIGNANT_COLOR = "#E11D48"
BENIGN_COLOR = "#0F766E"
AXIS_COLOR = "#64748b"

BACKGROUND_CLUSTERS = 10
PATIENT_NSAMPLES = 40
GLOBAL_SAMPLES = 60
MAX_CACHED_DATASETS = 8

# pyplot is not thread-safe and FastAPI runs sync endpoints in a thread pool
_lock = threading.Lock()
_cache: dict[tuple, dict] = {}


def fuse_risk(classical_probability: float, quantum_score: float) -> dict:
    """
    Soft-voting fusion of the two models: the mean of XGBoost's P(malignant)
    and the VQC score mapped from [-1, 1] onto [0, 1].
    """
    classical_probability = float(np.clip(classical_probability, 0.0, 1.0))
    quantum_probability = float(np.clip((quantum_score + 1.0) / 2.0, 0.0, 1.0))
    risk = (classical_probability + quantum_probability) / 2.0
    return {
        "classical_probability": round(classical_probability, 4),
        "classical_prediction": "Malignant" if classical_probability > 0.5 else "Benign",
        "quantum_score": round(float(quantum_score), 4),
        "quantum_probability": round(quantum_probability, 4),
        "quantum_prediction": "Malignant" if quantum_score > 0 else "Benign",
        "risk_probability": round(risk, 4),
        "diagnosis": "Malignant" if risk >= 0.5 else "Benign",
        "models_agree": (classical_probability > 0.5) == (quantum_score > 0),
    }


def evaluate_model(y_malignant, malignant_scores, threshold: float, inference_time: float) -> dict:
    """
    Held-out test-set benchmark with malignant as the positive class.
    malignant_scores: higher = more malignant; > threshold predicts malignant.
    """
    y_true = np.asarray(y_malignant).astype(int).ravel()
    scores = np.asarray(malignant_scores, dtype=float).ravel()
    y_pred = (scores > threshold).astype(int)

    tn, fp, fn, tp = (int(v) for v in confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel())
    sensitivity = tp / (tp + fn) if (tp + fn) else 0.0
    specificity = tn / (tn + fp) if (tn + fp) else 0.0
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    f1 = 2 * precision * sensitivity / (precision + sensitivity) if (precision + sensitivity) else 0.0

    if len(np.unique(y_true)) == 2:
        roc_auc = float(roc_auc_score(y_true, scores))
        fpr, tpr, _ = roc_curve(y_true, scores)
    else:
        roc_auc, fpr, tpr = None, np.array([0.0, 1.0]), np.array([0.0, 1.0])

    return {
        "metrics": {
            "accuracy": round((tp + tn) / len(y_true), 4),
            "f1": round(f1, 4),
            "sensitivity": round(sensitivity, 4),
            "specificity": round(specificity, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        },
        "confusion": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
        "roc": {
            "fpr": [round(float(v), 4) for v in fpr],
            "tpr": [round(float(v), 4) for v in tpr],
        },
        "inference_time": round(float(inference_time), 4),
        "n_test": int(len(y_true)),
        "n_malignant": int(y_true.sum()),
        "n_benign": int(len(y_true) - y_true.sum()),
    }


def _fig_to_data_uri(fig) -> str:
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def render_patient_plot(patient_shap, labels: list[str], score: float) -> str:
    # Caller must hold _lock (pyplot is not thread-safe)
    colors = [MALIGNANT_COLOR if v > 0 else BENIGN_COLOR for v in patient_shap]
    fig, ax = plt.subplots(figsize=(6.5, 3))
    ax.barh(np.arange(len(labels)), patient_shap, color=colors, align="center")
    ax.set_yticks(np.arange(len(labels)))
    ax.set_yticklabels(labels, fontsize=9)
    ax.invert_yaxis()
    ax.axvline(0, color=AXIS_COLOR, linestyle="--", linewidth=0.8)
    ax.set_xlabel("SHAP Impact (< 0 Benign | > 0 Malignant)", fontsize=9)
    ax.set_title(f"Quantum Diagnostic Attribution (Score: {score:.3f})", fontsize=11)
    plt.tight_layout()
    return _fig_to_data_uri(fig)


def render_global_plot(global_shap, X_global, labels: list[str]) -> str:
    # Caller must hold _lock (pyplot is not thread-safe)
    shap.summary_plot(
        global_shap,
        X_global,
        feature_names=labels,
        show=False,
        plot_size=(6.5, 3.2),
    )
    fig = plt.gcf()
    ax = plt.gca()
    ax.tick_params(labelsize=9)
    ax.set_xlabel("SHAP Impact (< 0 Benign | > 0 Malignant)", fontsize=9)
    ax.set_title(
        f"Global Quantum Model Attribution ({len(X_global)} test patients)",
        fontsize=11,
    )
    for colorbar_ax in fig.axes[1:]:
        colorbar_ax.tick_params(labelsize=8)
        colorbar_ax.set_ylabel("Feature value", fontsize=9)
    return _fig_to_data_uri(fig)


def _build(dataset_id: str, target_column: str | None) -> dict:
    df = load_dataset(dataset_id)
    try:
        metadata = load_dataset_metadata(dataset_id)
    except FileNotFoundError:
        metadata = {}

    if not target_column:
        target_column = metadata.get("target_column")

    X, y, resolved_target = extract_and_encode_target(df, target_column)
    malignant_class = resolve_malignant_class(df[resolved_target], metadata)

    # Same preprocessing and seeded VQC as POST /api/training/run, so this
    # reproduces the exact model whose metrics the pipeline reported
    preprocessing = PreprocessingPipeline()
    processed = preprocessing.fit_transform(X, y)
    X_train, X_test = processed["X_train"], processed["X_test"]
    y_test = np.asarray(processed["y_test"]).ravel()

    engine = ModelEngine()
    trained = engine.train_and_predict(
        model_type="vqc",
        X_train=X_train,
        y_train=processed["y_train"],
        X_test=X_test,
        y_test=processed["y_test"],
    )
    weights = trained["model"]

    # Same seeded XGBoost as the pipeline, for the classical half of the risk fusion
    xgb_model = engine.train_and_predict(
        model_type="xgboost",
        X_train=X_train,
        y_train=processed["y_train"],
        X_test=X_test,
        y_test=processed["y_test"],
    )["model"]

    # Orient the score so that > 0 always means "malignant"
    sign = 1.0 if malignant_class == 1 else -1.0

    def malignancy_score(rows):
        return sign * engine.vqc_scores(weights, rows)

    y_malignant = (y_test == malignant_class).astype(int)
    t0 = time.time()
    xgb_malignant_prob = xgb_model.predict_proba(X_test)[:, malignant_class]
    xgb_time = time.time() - t0
    t0 = time.time()
    vqc_malignant_score = malignancy_score(X_test)
    vqc_time = time.time() - t0
    benchmark = {
        "classical": evaluate_model(y_malignant, xgb_malignant_prob, 0.5, xgb_time),
        "quantum": evaluate_model(y_malignant, vqc_malignant_score, 0.0, vqc_time),
    }

    background = shap.kmeans(X_train, min(BACKGROUND_CLUSTERS, len(X_train)))
    explainer = shap.KernelExplainer(malignancy_score, background)
    labels = preprocessing.component_labels()

    X_global = X_test[:GLOBAL_SAMPLES]
    global_shap = np.asarray(
        explainer.shap_values(X_global, nsamples=PATIENT_NSAMPLES, silent=True)
    )

    return {
        "engine": engine,
        "weights": weights,
        "xgb_model": xgb_model,
        "explainer": explainer,
        "malignancy_score": malignancy_score,
        "labels": labels,
        "X_test": X_test,
        "y_test": y_test,
        "malignant_class": malignant_class,
        "target_column": resolved_target,
        "benchmark": benchmark,
        "global_shap": global_shap,
        "global_xai_plot": render_global_plot(global_shap, X_global, labels),
    }


def _get_bundle(dataset_id: str, target_column: str | None) -> dict:
    key = (dataset_id, target_column)
    if key not in _cache:
        if len(_cache) >= MAX_CACHED_DATASETS:
            _cache.pop(next(iter(_cache)))
        _cache[key] = _build(dataset_id, target_column)
    return _cache[key]


def explain_patient(
    dataset_id: str,
    sample_type: str = "malignant",
    target_column: str | None = None,
) -> dict:
    with _lock:
        bundle = _get_bundle(dataset_id, target_column)

        malignant_class = bundle["malignant_class"]
        wanted_class = malignant_class if sample_type == "malignant" else 1 - malignant_class
        candidates = np.where(bundle["y_test"] == wanted_class)[0]
        if len(candidates) == 0:
            raise ValueError(f"The test split contains no {sample_type} patients.")

        patient_idx = int(candidates[0])
        patient = bundle["X_test"][patient_idx:patient_idx + 1]

        score = float(bundle["malignancy_score"](patient)[0])
        patient_shap = np.asarray(
            bundle["explainer"].shap_values(patient, nsamples=PATIENT_NSAMPLES, silent=True)
        ).reshape(-1)
        labels = bundle["labels"]

        patient_plot = render_patient_plot(patient_shap, labels, score)

        classical_probability = float(
            bundle["xgb_model"].predict_proba(patient)[0][malignant_class]
        )
        global_importance = np.abs(bundle["global_shap"]).mean(axis=0)
        expected_value = float(np.ravel(bundle["explainer"].expected_value)[0])

        features = [
            {
                "feature": labels[i],
                "value": round(float(patient[0][i]), 4),
                "shap_value": round(float(patient_shap[i]), 4),
                "global_importance": round(float(global_importance[i]), 4),
            }
            for i in range(len(labels))
        ]
        features.sort(key=lambda item: abs(item["shap_value"]), reverse=True)

        return {
            "status": "success",
            "dataset_id": dataset_id,
            "target_column": bundle["target_column"],
            "model": "VQC (4 qubits, 3 layers, PennyLane default.qubit)",
            "explainer": "KernelExplainer",
            "sample_type": sample_type,
            "patient": {
                "test_index": patient_idx,
                "true_label": "Malignant" if wanted_class == malignant_class else "Benign",
            },
            "quantum_score": round(score, 3),
            "diagnosis": "Malignant" if score > 0 else "Benign",
            "base_value": round(expected_value, 4),
            "fusion": fuse_risk(classical_probability, score),
            "benchmark": bundle["benchmark"],
            "features": features,
            "patient_xai_plot": patient_plot,
            "global_xai_plot": bundle["global_xai_plot"],
        }


def render_uploaded_patient_plots(
    labels: list[str],
    patient_shap: np.ndarray,
    score: float,
    global_shap: np.ndarray,
    X_global: np.ndarray,
) -> dict:
    """
    The same two plots as the dataset explanation, for a patient uploaded for
    testing: their quantum attribution, and the model's global attribution.
    """
    with _lock:
        return {
            "patient_xai_plot": render_patient_plot(patient_shap, labels, score),
            "global_xai_plot": render_global_plot(global_shap, X_global, labels),
        }
