from pathlib import Path

from app.services.preprocessing_service import PreprocessingPipeline
from app.services.model_engine import ModelEngine


class TrainingPipeline:

    def __init__(self):

        self.preprocessing = PreprocessingPipeline()
        self.model_engine = ModelEngine()

        # Anchored to backend/, not the cwd uvicorn happened to start in
        self.artifact_dir = Path(__file__).resolve().parents[2] / "data" / "artifacts"
        self.artifact_dir.mkdir(
            parents=True,
            exist_ok=True
        )

    def run(
        self,
        X,
        y,
        model_type: str
    ):

        # 1. Preprocess dataset
        processed = self.preprocessing.fit_transform(
            X,
            y
        )

        # 2. Save fitted preprocessing pipeline
        preprocessing_path = (
            self.artifact_dir /
            "preprocessing.joblib"
        )

        self.preprocessing.save(
            preprocessing_path
        )

        # 3. Extract processed data
        X_train = processed["X_train"]
        X_test = processed["X_test"]

        y_train = processed["y_train"]
        y_test = processed["y_test"]

        # 4. Train and evaluate selected model
        result = self.model_engine.train_and_predict(
            model_type=model_type,
            X_train=X_train,
            y_train=y_train,
            X_test=X_test,
            y_test=y_test,
        )

        # 5. Return complete result
        return {
            "model_type": model_type,
            "preprocessing": processed["metadata"],
            "preprocessing_artifact": str(
                preprocessing_path
            ),
            "train": result["train"],
            "result": result["result"],
            "config": result["config"],
        }