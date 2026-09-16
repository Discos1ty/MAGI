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