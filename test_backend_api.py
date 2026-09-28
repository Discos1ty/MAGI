import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("--- 1. Testing Health Endpoint ---")
resp = requests.get(f"{BASE_URL}/")
print("Status:", resp.status_code)
print("Response:", resp.json())

print("\n--- 2. Ingesting WDBC Dataset (data/raw/breast_cancer_dataset_full.csv) ---")
resp = requests.post(f"{BASE_URL}/api/dataset/sample/wdbc")
print("Status:", resp.status_code)
sample_data = resp.json()
ds_id = sample_data.get("dataset_id")
print(f"Dataset ID: {ds_id} | Rows: {sample_data.get('dataset', {}).get('rows')} | Target: {sample_data.get('dataset', {}).get('target_column')}")

print("\n--- 3. Testing Preprocessing Pipeline (PCA 4 Components) ---")
resp = requests.post(
    f"{BASE_URL}/api/dataset/preprocess",
    params={"dataset_id": ds_id, "n_components": 4, "variance_threshold": 0.0}
)
print("Status:", resp.status_code)
prep_data = resp.json().get("preprocessing", {})
print(f"Train Shape: {prep_data.get('train_shape')} | Test Shape: {prep_data.get('test_shape')}")
print(f"Total Explained Variance: {prep_data.get('total_explained_variance')}")

print("\n--- 4. Training Classical ML: XGBoost ---")
resp = requests.post(
    f"{BASE_URL}/api/training/run",
    params={"dataset_id": ds_id, "model_type": "xgboost"}
)
print("Status:", resp.status_code)
xgb_res = resp.json()
if resp.status_code == 200:
    metrics = xgb_res.get("result", {}).get("metrics", {})
    timing = xgb_res.get("result", {}).get("timing", {})
    print("XGBoost Metrics:", json.dumps(metrics, indent=2))
    print("XGBoost Timing:", json.dumps(timing, indent=2))
else:
    print("Error:", xgb_res)

print("\n--- 5. Training Quantum ML: VQC ---")
resp = requests.post(
    f"{BASE_URL}/api/training/run",
    params={"dataset_id": ds_id, "model_type": "vqc"}
)
print("Status:", resp.status_code)
vqc_res = resp.json()
if resp.status_code == 200:
    metrics = vqc_res.get("result", {}).get("metrics", {})
    timing = vqc_res.get("result", {}).get("timing", {})
    print("VQC Metrics:", json.dumps(metrics, indent=2))
    print("VQC Timing:", json.dumps(timing, indent=2))
else:
    print("Error:", vqc_res)

print("\n--- 6. Verifying Rejection of Disallowed Models (e.g. logistic_regression, svm) ---")
for disallowed in ["logistic_regression", "svm"]:
    resp = requests.post(
        f"{BASE_URL}/api/training/run",
        params={"dataset_id": ds_id, "model_type": disallowed}
    )
    print(f"Model '{disallowed}' -> Status: {resp.status_code} (Expected 400), Detail: {resp.json().get('detail')}")
