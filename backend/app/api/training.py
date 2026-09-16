from fastapi import APIRouter, HTTPException, Depends

from app.services.dataset_store import load_dataset, load_dataset_metadata
from app.services.training_pipeline import TrainingPipeline

from app.models.experiment import (
    ExperimentCreate,
    DatasetInfo,
    PreprocessingInfo,
    ModelInfo,
    QuantumInfo,
    ExperimentResults,
    EvaluationInfo,
)
from app.services.experiment_service import create_experiment
from app.core.dependencies import get_db


router = APIRouter(
    prefix="/api/training",
    tags=["Training"]
)


@router.post("/run")
def run_training(
    dataset_id: str,
    model_type: str = "logistic_regression",
    db=Depends(get_db)
):
    supported_models = {
        "logistic_regression",
        "vqc",
        "quantum_kernel_svm",
    }

    if model_type not in supported_models:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model type: {model_type}"
        )

    
    try:
        # 1. Load stored dataset
        df = load_dataset(dataset_id)
        dataset_metadata = load_dataset_metadata(dataset_id)

        dataset_info = DatasetInfo(
            name=dataset_metadata["filename"],
            samples=dataset_metadata["rows"],
            features=dataset_metadata["features"],
        )

        # 2. Identify target column
        target_column = "Diagnosis"

        if target_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{target_column}' was not found."
            )

        # 3. Separate features and target
        X = df.drop(columns=[target_column])

        y = df[target_column].map({
            "B": 0,
            "M": 1
        })

        if y.isnull().any():
            raise HTTPException(
                status_code=400,
                detail="Target contains unsupported or missing values."
            )

        # 4. Run training pipeline
        pipeline = TrainingPipeline()

        result = pipeline.run(
            X=X,
            y=y,
            model_type=model_type
        )

        preprocessing_info = PreprocessingInfo(
            scaler="StandardScaler + PCA + MinMaxScaler",
            pca_components=result["preprocessing"]["pca_components"],
            random_seed=42,
        )

        model_config = result["config"]

        model_info = ModelInfo(
            type=model_config["type"],
            qubits=model_config["qubits"],
            layers=model_config["layers"],
            epochs=model_config["epochs"],
            learning_rate=model_config["learning_rate"],
        )

        quantum_info = QuantumInfo(
            simulator="default.qubit"
            if model_type in {"vqc", "quantum_kernel_svm"}
            else None,
            noise_model=None,
            backend=None,
        )

        experiment_results = ExperimentResults(
            accuracy=result["result"].metrics.accuracy,
            f1=result["result"].metrics.f1,
            sensitivity=result["result"].metrics.sensitivity,
            specificity=result["result"].metrics.specificity,
            roc_auc=result["result"].metrics.roc_auc,
            training_time=result["result"].timing.training_time,
            inference_time=result["result"].timing.inference_time,
        )

        evaluation_info = EvaluationInfo(
            evaluation_type="single_train_test_split",
            cv_folds=None,
            decision_threshold=None,
        )

        experiment = ExperimentCreate(
            name=f"{model_type} - {dataset_info.name}",
            dataset=dataset_info,
            preprocessing=preprocessing_info,
            model=model_info,
            quantum=quantum_info,
            results=experiment_results,
            evaluation=evaluation_info,
        )

        saved_experiment = create_experiment(db, experiment)

        return {
            "status": "success",
            "dataset_id": dataset_id,
            "model_type": result["model_type"],
            "experiment_id": saved_experiment.id,
            "preprocessing": result["preprocessing"],
            "preprocessing_artifact": result["preprocessing_artifact"],
            "train": (
                result["train"].model_dump()
                if hasattr(result["train"], "model_dump")
                else result["train"]
                ),
            "result": (
                    result["result"].model_dump()
                    if hasattr(result["result"], "model_dump")
                    else result["result"]
                )
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset '{dataset_id}' was not found."
        )

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )