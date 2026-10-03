from pathlib import Path
import json
import uuid
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[3]

UPLOAD_DIR = PROJECT_ROOT / "data" / "uploads"
METADATA_DIR = PROJECT_ROOT / "data" / "metadata"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
METADATA_DIR.mkdir(parents=True, exist_ok=True)


def save_dataset(
    df: pd.DataFrame,
    filename: str | None = None,
    target_column: str | None = None,
    extra_metadata: dict | None = None
) -> str:

    dataset_id = str(uuid.uuid4())

    file_path = UPLOAD_DIR / f"{dataset_id}.csv"
    metadata_path = METADATA_DIR / f"{dataset_id}.json"

    df.to_csv(file_path, index=False)

    metadata = {
        "dataset_id": dataset_id,
        "filename": filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "features": int(df.shape[1] - 1),
        "target_column": target_column,
        **(extra_metadata or {}),
    }

    with open(
        metadata_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            metadata,
            file,
            indent=4
        )

    return dataset_id


def load_dataset(
    dataset_id: str
) -> pd.DataFrame:

    file_path = UPLOAD_DIR / f"{dataset_id}.csv"

    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset '{dataset_id}' was not found."
        )

    return pd.read_csv(file_path)


def load_dataset_metadata(
    dataset_id: str
) -> dict:

    metadata_path = (
        METADATA_DIR /
        f"{dataset_id}.json"
    )

    if not metadata_path.exists():
        raise FileNotFoundError(
            f"Metadata for dataset '{dataset_id}' was not found."
        )

    with open(
        metadata_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def list_datasets() -> list[dict]:
    datasets = []

    for metadata_path in METADATA_DIR.glob("*.json"):
        try:
            with open(
                metadata_path,
                "r",
                encoding="utf-8"
            ) as file:
                metadata = json.load(file)

            datasets.append(metadata)

        except (json.JSONDecodeError, OSError):
            continue

    return datasets
