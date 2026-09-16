import pandas as pd


def combine_features_and_target(
    features_df: pd.DataFrame,
    target_df: pd.DataFrame
) -> pd.DataFrame:

    if len(features_df) != len(target_df):
        raise ValueError(
            "Features and target datasets must have "
            "the same number of rows."
        )

    if target_df.shape[1] != 1:
        raise ValueError(
            "Target dataset must contain exactly one column."
        )

    target_column = target_df.columns[0]

    prepared_df = features_df.copy()

    prepared_df[target_column] = target_df.iloc[:, 0].values

    return prepared_df