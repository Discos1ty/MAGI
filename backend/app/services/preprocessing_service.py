import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.feature_selection import VarianceThreshold


class PreprocessingPipeline:

    def __init__(
        self,
        test_size: float = 0.2,
        random_state: int = 42,
        n_components: int = 4,
        variance_threshold: float = 0.0
    ):
        self.test_size = test_size
        self.random_state = random_state
        self.n_components = n_components
        self.variance_threshold = variance_threshold

        # Feature selection
        self.feature_selector = VarianceThreshold(
            threshold=variance_threshold
        )

        # Standardization
        self.scaler = StandardScaler()

        # Dimensionality reduction
        self.pca = PCA(
            n_components=n_components
        )

        # Quantum angle mapping
        self.angle_scaler = MinMaxScaler(
            feature_range=(-np.pi, np.pi)
        )

        self.is_fitted = False



    def get_config(self):
        return {
            "test_size": self.test_size,
            "random_state": self.random_state,
            "variance_threshold": self.variance_threshold,
            "pca_components": self.n_components,
            "scaler": "StandardScaler",
            "angle_scaler": "MinMaxScaler",
            "angle_range": [-np.pi, np.pi],
        }


    def save(self, file_path):
        joblib.dump(self, file_path)


    def load(self, file_path):
        loaded_pipeline = joblib.load(file_path)

        self.__dict__.update(
            loaded_pipeline.__dict__
        )

        return self



    def fit_transform(
        self,
        X: pd.DataFrame,
        y: pd.Series
    ) -> dict:

        # 1. Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y
        )

        # 2. Feature selection
        X_train_selected = self.feature_selector.fit_transform(
            X_train
        )

        X_test_selected = self.feature_selector.transform(
            X_test
        )

        # 3. Standardization
        X_train_scaled = self.scaler.fit_transform(
            X_train_selected
        )

        X_test_scaled = self.scaler.transform(
            X_test_selected
        )

        # 4. PCA
        X_train_pca = self.pca.fit_transform(
            X_train_scaled
        )

        X_test_pca = self.pca.transform(
            X_test_scaled
        )

        # 5. Convert PCA features to quantum angles
        X_train_angles = self.angle_scaler.fit_transform(
            X_train_pca
        )

        X_test_angles = self.angle_scaler.transform(
            X_test_pca
        )

        self.is_fitted = True

        # 6. Return processed data + metadata
        return {
            "X_train": X_train_angles,
            "X_test": X_test_angles,
            "y_train": y_train,
            "y_test": y_test,

            "metadata": {
                "original_features": int(
                    X.shape[1]
                ),

                "selected_features": int(
                    X_train_selected.shape[1]
                ),

                "removed_features": int(
                    X_train.shape[1]
                    - X_train_selected.shape[1]
                ),

                "pca_components": self.n_components,

                "explained_variance_ratio": (
                    self.pca
                    .explained_variance_ratio_
                    .tolist()
                ),

                "total_explained_variance": float(
                    self.pca
                    .explained_variance_ratio_
                    .sum()
                ),

                "angle_range": [
                    -np.pi,
                    np.pi
                ],

                "train_rows": int(
                    X_train.shape[0]
                ),

                "test_rows": int(
                    X_test.shape[0]
                )
            }
        }

    def transform(
        self,
        X: pd.DataFrame
    ) -> np.ndarray:

        if not self.is_fitted:
            raise RuntimeError(
                "PreprocessingPipeline must be fitted "
                "before calling transform()."
            )

        # Apply the SAME fitted transformations
        X_selected = self.feature_selector.transform(
            X
        )

        X_scaled = self.scaler.transform(
            X_selected
        )

        X_pca = self.pca.transform(
            X_scaled
        )

        X_angles = self.angle_scaler.transform(
            X_pca
        )

        return X_angles