import pandas as pd


def validate_dataset(
    df: pd.DataFrame,
    target_column: str
) -> dict:

    errors = []
    warnings = []

    # Basic validation
    if df.empty:
        errors.append("Dataset is empty.")

    if target_column not in df.columns:
        errors.append(
            f"Target column '{target_column}' was not found."
        )

    # Duplicate rows
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count > 0:
        warnings.append(
            f"{duplicate_count} duplicate rows detected."
        )

    # Missing values
    missing_count = int(df.isnull().sum().sum())

    if missing_count > 0:
        warnings.append(
            f"{missing_count} missing values detected."
        )

    # Constant columns
    constant_columns = [
        column
        for column in df.columns
        if df[column].nunique(dropna=False) <= 1
    ]

    if constant_columns:
        warnings.append(
            f"Constant columns detected: {constant_columns}"
        )

    # Target validation
    target_classes = []

    if target_column in df.columns:

        target_classes = (
            df[target_column]
            .dropna()
            .unique()
            .tolist()
        )

        if len(target_classes) < 2:
            errors.append(
                "Target column must contain at least two classes."
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "duplicate_rows": duplicate_count,
        "missing_values": missing_count,
        "constant_columns": constant_columns,
        "target_column": target_column,
        "target_classes": target_classes
    }