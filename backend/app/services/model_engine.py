import time
from types import SimpleNamespace
import numpy as np
import xgboost as xgb
import pennylane as qml
from pennylane import numpy as pnp
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
)


class ModelEngine:
    def __init__(self, n_qubits: int = 4, n_layers: int = 3):
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.dev = qml.device("default.qubit", wires=self.n_qubits)

    def _build_vqc_circuit(self):
        @qml.qnode(self.dev)
        def circuit(weights, features):
            for i in range(self.n_qubits):
                qml.RY(features[i], wires=i)
            qml.BasicEntanglerLayers(weights, wires=range(self.n_qubits))
            return qml.expval(qml.PauliZ(0))

        return circuit

    def train_and_predict(self, model_type: str, X_train, y_train, X_test, y_test):
        t0 = time.time()
        y_train_arr = np.array(y_train).ravel()
        y_test_arr = np.array(y_test).ravel()

        if model_type == "xgboost":
            model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=3,
                learning_rate=0.1,
                random_state=42,
                eval_metric="logloss",
            )
            model.fit(X_train, y_train_arr)
            t_train = time.time() - t0

            t_inf_start = time.time()
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
            t_inf = time.time() - t_inf_start

            config = {
                "type": "xgboost",
                "n_estimators": 100,
                "max_depth": 3,
                "learning_rate": 0.1,
                "qubits": None,
                "layers": None,
                "epochs": None,
            }
            train_meta = {
                "status": "trained",
                "model": "XGBoost",
                "n_estimators": 100,
                "max_depth": 3,
            }

        elif model_type == "vqc":
            circuit = self._build_vqc_circuit()
            pnp.random.seed(42)
            weights = pnp.random.uniform(
                0, 2 * np.pi, (self.n_layers, self.n_qubits), requires_grad=True
            )

            epochs = 6
            opt = qml.AdamOptimizer(stepsize=0.08)
            y_train_q = np.where(y_train_arr == 0, -1.0, 1.0)

            # Subsample for efficient quantum simulation on CPU
            sub_idx = min(100, len(X_train))
            X_sub = X_train[:sub_idx]
            y_sub = y_train_q[:sub_idx]

            def cost(w):
                preds = [circuit(w, x) for x in X_sub]
                return pnp.mean((y_sub - pnp.array(preds)) ** 2)

            for _ in range(epochs):
                weights = opt.step(cost, weights)

            t_train = time.time() - t0

            t_inf_start = time.time()
            raw_scores = [float(circuit(weights, x)) for x in X_test]
            y_prob = [1.0 / (1.0 + np.exp(-s * 2.0)) for s in raw_scores]
            y_pred = [1 if p >= 0.5 else 0 for p in y_prob]
            t_inf = time.time() - t_inf_start

            config = {
                "type": "vqc",
                "qubits": self.n_qubits,
                "layers": self.n_layers,
                "epochs": epochs,
                "learning_rate": 0.08,
            }
            train_meta = {
                "status": "trained",
                "model": "VariationalQuantumClassifier",
                "qubits": self.n_qubits,
                "layers": self.n_layers,
                "epochs": epochs,
            }

        else:
            raise ValueError(
                f"Unsupported model type: '{model_type}'. Only 'xgboost' (Classical ML) and 'vqc' (Quantum ML) are supported."
            )

        # Performance evaluation
        acc = float(accuracy_score(y_test_arr, y_pred))
        f1 = float(f1_score(y_test_arr, y_pred, zero_division=0))
        sensitivity = float(recall_score(y_test_arr, y_pred, zero_division=0))

        try:
            roc_auc = float(roc_auc_score(y_test_arr, y_prob))
        except Exception:
            roc_auc = acc

        cm = confusion_matrix(y_test_arr, y_pred)
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
            specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 1.0
        else:
            specificity = 1.0

        metrics_obj = SimpleNamespace(
            accuracy=round(acc, 4),
            f1=round(f1, 4),
            sensitivity=round(sensitivity, 4),
            specificity=round(specificity, 4),
            roc_auc=round(roc_auc, 4),
        )

        timing_obj = SimpleNamespace(
            training_time=round(t_train, 4),
            inference_time=round(t_inf, 4),
        )

        return {
            "train": train_meta,
            "result": SimpleNamespace(metrics=metrics_obj, timing=timing_obj),
            "config": config,
        }
