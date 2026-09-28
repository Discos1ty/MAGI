from pydantic import BaseModel, ConfigDict
from typing import Optional, Any

class DatasetInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: Optional[str] = "dataset.csv"
    samples: Optional[int] = 0
    features: Optional[int] = 0

class PreprocessingInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    scaler: Optional[str] = "StandardScaler"
    pca_components: Optional[int] = 4
    random_seed: Optional[int] = 42

class ModelInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: str
    qubits: Optional[int] = 4
    layers: Optional[int] = 3
    epochs: Optional[int] = 10
    learning_rate: Optional[float] = 0.01

class QuantumInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    simulator: Optional[str] = "default.qubit"
    noise_model: Optional[str] = None
    backend: Optional[str] = None

class EvaluationInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    evaluation_type: Optional[str] = "single_train_test_split"
    cv_folds: Optional[int] = None
    decision_threshold: Optional[float] = None

class ExperimentResults(BaseModel):
    model_config = ConfigDict(extra="allow")
    accuracy: Optional[float] = 0.0
    f1: Optional[float] = 0.0
    sensitivity: Optional[float] = 0.0
    specificity: Optional[float] = 0.0
    roc_auc: Optional[float] = 0.0
    training_time: Optional[float] = 0.0
    inference_time: Optional[float] = 0.0

class ExperimentCreate(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: Optional[str] = None
    dataset: Optional[DatasetInfo] = None
    preprocessing: Optional[PreprocessingInfo] = None
    model: Optional[ModelInfo] = None
    quantum: Optional[QuantumInfo] = None
    results: Optional[ExperimentResults] = None
    evaluation: Optional[EvaluationInfo] = None
