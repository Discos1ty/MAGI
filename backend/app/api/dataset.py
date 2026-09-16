from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO
from app.services.dataset_validator import validate_dataset
from app.services.dataset_service import process_dataset

from app.services.dataset_preparation import (
    combine_features_and_target
)

from app.services.dataset_store import save_dataset, list_datasets

from app.services.dataset_store import load_dataset
from app.services.preprocessing_service import PreprocessingPipeline


router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"]
)


@router.get("/")
async def get_datasets():
    return {
        "status": "success",
        "datasets": list_datasets()
    }


@router.post("/profile")
async def profile_dataset(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are currently supported."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )

    missing_values = int(df.isnull().sum().sum())

    return {
        "filename": file.filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "missing_values": missing_values,
        "numeric_columns": int(
            df.select_dtypes(include="number").shape[1]
        ),
        "categorical_columns": int(
            df.select_dtypes(exclude="number").shape[1]
        )
    }

# Prepare Dataset

@router.post("/prepare")
async def prepare_dataset(
    features_file: UploadFile = File(...),
    target_file: UploadFile = File(...)
):
    if not features_file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Features file must be a CSV."
        )

    if not target_file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Target file must be a CSV."
        )

    try:
        features_contents = await features_file.read()
        target_contents = await target_file.read()

        features_df = pd.read_csv(
            BytesIO(features_contents)
        )

        target_df = pd.read_csv(
            BytesIO(target_contents)
        )

        prepared_df = combine_features_and_target(
            features_df,
            target_df
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to prepare dataset: {str(e)}"
        )

    return {
        "status": "success",
        "rows": int(prepared_df.shape[0]),
        "columns": int(prepared_df.shape[1]),
        "feature_columns": int(prepared_df.shape[1] - 1),
        "target_column": target_df.columns[0],
        "target_classes": (
            prepared_df[target_df.columns[0]]
            .dropna()
            .unique()
            .tolist()
        )
    }


# Validation

@router.post("/validate")
async def validate_uploaded_dataset(
    file: UploadFile = File(...),
    target_column: str = "Diagnosis"
):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are currently supported."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )

    return validate_dataset(
        df,
        target_column
    )


# Ingest Dataset 

@router.post("/ingest")
async def ingest_dataset(
    features_file: UploadFile = File(...),
    target_file: UploadFile | None = File(None),
    target_column: str | None = None
):
    if not features_file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Features file must be a CSV."
        )

    if target_file is not None and not target_file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Target file must be a CSV."
        )

    try:
        features_contents = await features_file.read()
        features_df = pd.read_csv(
            BytesIO(features_contents)
        )

        if target_file is not None:
            target_contents = await target_file.read()
            target_df = pd.read_csv(
                BytesIO(target_contents)
            )

            # Combine features + target
            prepared_df = combine_features_and_target(
                features_df,
                target_df
            )

            # Determine target column
            if target_column is None:
                target_column = target_df.columns[0]
        else:
            # Single file with features and target
            prepared_df = features_df
            if target_column is None:
                # Default to 'Diagnosis' if present, otherwise last column
                if "Diagnosis" in prepared_df.columns:
                    target_column = "Diagnosis"
                elif "diagnosis" in prepared_df.columns:
                    target_column = "diagnosis"
                else:
                    target_column = prepared_df.columns[-1]

        # Validate complete dataset
        validation = validate_dataset(
            prepared_df,
            target_column
        )

        if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail=validation
            )

        # Save dataset
        dataset_id = save_dataset(
            prepared_df,
            filename=features_file.filename
        )

        return {
            "status": "success",
            "dataset_id": dataset_id,
            "filename": features_file.filename,

            "dataset": {
                "rows": int(prepared_df.shape[0]),
                "columns": int(prepared_df.shape[1]),
                "features": int(
                    prepared_df.shape[1] - 1
                ),
                "target_column": target_column,
                "target_classes": (
                    prepared_df[target_column]
                    .dropna()
                    .unique()
                    .tolist()
                )
            },

            "profile": {
                "missing_values": int(
                    prepared_df.isnull().sum().sum()
                ),
                "numeric_columns": int(
                    prepared_df
                    .select_dtypes(include="number")
                    .shape[1]
                ),
                "categorical_columns": int(
                    prepared_df
                    .select_dtypes(exclude="number")
                    .shape[1]
                )
            },

            "validation": validation
        }

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Dataset ingestion failed: {str(e)}"
        )


# Preprocessing 

@router.post("/preprocess")
async def preprocess_dataset(
    dataset_id: str,
    n_components: int = 4,
    variance_threshold: float = 0.0
):
    try:
        # 1. Load stored dataset
        df = load_dataset(dataset_id)

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

        # 4. Create preprocessing pipeline
        pipeline = PreprocessingPipeline(
            n_components=n_components,
            variance_threshold=variance_threshold
        )

        # 5. Preprocess
        result = pipeline.fit_transform(X, y)

        # 6. Return metadata
        return {
            "status": "success",
            "dataset_id": dataset_id,

            "preprocessing": {
                "train_shape": list(
                    result["X_train"].shape
                ),
                "test_shape": list(
                    result["X_test"].shape
                ),

                **result["metadata"]
            }
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
            detail=f"Preprocessing failed: {str(e)}"
        )