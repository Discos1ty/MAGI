from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO
from app.services.dataset_validator import validate_dataset
from app.services.dataset_service import process_dataset

from app.services.dataset_preparation import (
    combine_features_and_target
)

from app.services.dataset_store import (
    save_dataset,
    list_datasets,
    load_dataset,
    load_dataset_metadata,
    PROJECT_ROOT,
    UPLOAD_DIR
)
from app.services.dataset_service import (
    extract_and_encode_target,
    resolve_malignant_class
)
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


@router.post("/sample/wdbc")
async def load_sample_wdbc():
    raw_path = PROJECT_ROOT / "data" / "raw" / "breast_cancer_dataset_full.csv"
    if not raw_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Sample dataset not found at data/raw/breast_cancer_dataset_full.csv"
        )

    return _save_wdbc_sample(pd.read_csv(raw_path), "breast_cancer_dataset_full.csv")


# Cached response for the scikit-learn WDBC copy, reused so repeat benchmark runs don't pile up uploads
_sklearn_wdbc_response = None


@router.post("/sample/sklearn-wdbc")
async def load_sklearn_wdbc():
    global _sklearn_wdbc_response

    # Reuse the saved copy only while its CSV is still on disk (uploads may be cleared while the server runs)
    if _sklearn_wdbc_response is not None:
        if (UPLOAD_DIR / f"{_sklearn_wdbc_response['dataset_id']}.csv").exists():
            return _sklearn_wdbc_response
        _sklearn_wdbc_response = None

    from sklearn.datasets import load_breast_cancer

    # as_frame gives the 30 named biomarkers plus a "target" column
    df = load_breast_cancer(as_frame=True).frame
    _sklearn_wdbc_response = _save_wdbc_sample(df, "sklearn.datasets.load_breast_cancer")
    return _sklearn_wdbc_response


def _save_wdbc_sample(df: pd.DataFrame, filename: str) -> dict:
    target_column = "target"
    validation = validate_dataset(df, target_column)

    dataset_id = save_dataset(
        df,
        filename=filename,
        target_column=target_column,
        # scikit-learn's WDBC encoding: 0 = malignant, 1 = benign
        extra_metadata={"malignant_value": 0}
    )

    return {
        "status": "success",
        "dataset_id": dataset_id,
        "filename": filename,
        "dataset": {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "features": int(df.shape[1] - 1),
            "target_column": target_column,
            "target_classes": df[target_column].dropna().unique().tolist()
        },
        "profile": {
            "missing_values": int(df.isnull().sum().sum()),
            "numeric_columns": int(df.select_dtypes(include="number").shape[1]),
            "categorical_columns": int(df.select_dtypes(exclude="number").shape[1])
        },
        "validation": validation
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
            filename=features_file.filename,
            target_column=target_column
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
    variance_threshold: float = 0.0,
    target_column: str | None = None
):
    try:
        # 1. Load stored dataset and metadata
        df = load_dataset(dataset_id)
        try:
            metadata = load_dataset_metadata(dataset_id)
        except Exception:
            metadata = {}

        if not target_column:
            target_column = metadata.get("target_column")

        # 2. Extract features and encoded binary target
        X, y, resolved_target_column = extract_and_encode_target(
            df, target_column
        )

        # 3. Create preprocessing pipeline
        pipeline = PreprocessingPipeline(
            n_components=n_components,
            variance_threshold=variance_threshold
        )

        # 4. Preprocess
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


# PCA Projection

@router.get("/pca-projection")
async def pca_projection(
    dataset_id: str,
    target_column: str | None = None
):
    try:
        df = load_dataset(dataset_id)
        try:
            metadata = load_dataset_metadata(dataset_id)
        except FileNotFoundError:
            metadata = {}

        if not target_column:
            target_column = metadata.get("target_column")

        X, y, resolved_target_column = extract_and_encode_target(
            df, target_column
        )
        malignant_class = resolve_malignant_class(
            df[resolved_target_column], metadata
        )

        # Same fit as the training pipeline, then project every patient
        pipeline = PreprocessingPipeline()
        result = pipeline.fit_transform(X, y)

        projected = pipeline.pca.transform(
            pipeline.scaler.transform(
                pipeline.feature_selector.transform(X)
            )
        )
        test_rows = set(result["y_test"].index)

        points = [
            {
                "pc1": round(float(row[0]), 4),
                "pc2": round(float(row[1]), 4),
                "label": "malignant" if label == malignant_class else "benign",
                "split": "test" if index in test_rows else "train",
            }
            for index, row, label in zip(X.index, projected, y)
        ]

        return {
            "status": "success",
            "dataset_id": dataset_id,
            "target_column": resolved_target_column,
            "components": pipeline.component_labels(),
            "explained_variance_ratio": result["metadata"]["explained_variance_ratio"],
            "total_explained_variance": result["metadata"]["total_explained_variance"],
            "points": points
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Dataset '{dataset_id}' was not found."
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PCA projection failed: {str(e)}"
        )
