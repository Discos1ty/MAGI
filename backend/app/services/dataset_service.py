import pandas as pd

from app.services.dataset_preparation import (
    combine_features_and_target
)

from app.services.dataset_validator import (
    validate_dataset
)


def process_dataset(
    features_df: pd.DataFrame,
    target_df: pd.DataFrame,
    target_column: str | None = None
) -> dict:

    # --------------------------------------------------------
    # 1. Prepare
    # --------------------------------------------------------

    prepared_df = combine_features_and_target(
        features_df,
        target_df
    )

    # --------------------------------------------------------
    # 2. Determine target column
    # --------------------------------------------------------

    if target_column is None:
        target_column = target_df.columns[0]

    # --------------------------------------------------------
    # 3. Profile
    # --------------------------------------------------------

    missing_values = int(
        prepared_df.isnull().sum().sum()
    )

    numeric_columns = int(
        prepared_df.select_dtypes(
            include="number"
        ).shape[1]
    )

    categorical_columns = int(
        prepared_df.select_dtypes(
            exclude="number"
        ).shape[1]
    )

    # --------------------------------------------------------
    # 4. Validate
    # --------------------------------------------------------

    validation = validate_dataset(
        prepared_df,
        target_column
    )

    # --------------------------------------------------------
    # 5. Return complete result
    # --------------------------------------------------------

    return {
        "dataset": {
            "rows": int(prepared_df.shape[0]),
            "columns": int(prepared_df.shape[1]),
            "features": int(prepared_df.shape[1] - 1),
            "target_column": target_column,
            "target_classes": (
                prepared_df[target_column]
                .dropna()
                .unique()
                .tolist()
            )
        },

        "profile": {
            "missing_values": missing_values,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns
        },

        "validation": validation
    }


def extract_and_encode_target(df: pd.DataFrame, target_column: str | None = None):
    """
    Robustly extracts features X and binary target y (0/1) from df.
    Works with integer (0/1), string ('B'/'M', 'benign'/'malignant'),
    or explicit target column name.
    """
    if target_column and target_column in df.columns:
        col = target_column
    elif "target" in df.columns:
        col = "target"
    elif "Diagnosis" in df.columns:
        col = "Diagnosis"
    elif "diagnosis" in df.columns:
        col = "diagnosis"
    else:
        col = df.columns[-1]

    y_raw = df[col]
    X = df.drop(columns=[col])

    id_cols = [c for c in X.columns if c.lower() in ["id", "patient_id", "sample_id", "case_id"]]
    if id_cols:
        X = X.drop(columns=id_cols)

    unique_vals = y_raw.dropna().unique()
    if set(unique_vals).issubset({0, 1}):
        y = y_raw.astype(int)
    else:
        str_map = {}
        for val in unique_vals:
            str_val = str(val).strip().upper()
            if str_val in ["0", "B", "BENIGN", "NEGATIVE", "HEALTHY", "NORMAL", "FALSE"]:
                str_map[val] = 0
            elif str_val in ["1", "M", "MALIGNANT", "POSITIVE", "SICK", "DISEASED", "TRUE"]:
                str_map[val] = 1

        if len(str_map) < len(unique_vals):
            sorted_vals = sorted(unique_vals, key=lambda v: str(v))
            str_map = {val: idx for idx, val in enumerate(sorted_vals[:2])}

        y = y_raw.map(str_map).fillna(0).astype(int)

    return X, y, col