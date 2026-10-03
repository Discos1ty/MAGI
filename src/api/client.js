const API_BASE = '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errDetail = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        const detail = errJson.detail;
        if (typeof detail === 'string') {
          errDetail = detail;
        } else if (detail?.errors?.length) {
          // Dataset validation failures come back as { errors: [...], warnings: [...] }
          errDetail = detail.errors.join(' ');
        } else {
          errDetail = JSON.stringify(detail ?? errJson);
        }
      } catch {
        // use default
      }
      throw new Error(errDetail);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export async function checkBackendHealth() {
  return await request('/api/predict/health');
}

export async function getSampleWDBC() {
  return await request('/api/dataset/sample/wdbc', {
    method: 'POST',
  });
}

// Wisconsin Diagnostic Breast Cancer data loaded directly from scikit-learn
export async function getSklearnWDBC() {
  return await request('/api/dataset/sample/sklearn-wdbc', {
    method: 'POST',
  });
}

export async function ingestDatasetFiles(formData, targetColumn = null) {
  const query = targetColumn
    ? `?${new URLSearchParams({ target_column: targetColumn }).toString()}`
    : '';

  return await request(`/api/dataset/ingest${query}`, {
    method: 'POST',
    body: formData,
  });
}

export async function runPreprocessing(datasetId, nComponents = 4, varianceThreshold = 0.0, targetColumn = null) {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    n_components: nComponents.toString(),
    variance_threshold: varianceThreshold.toString(),
  });
  if (targetColumn) params.append('target_column', targetColumn);

  return await request(`/api/dataset/preprocess?${params.toString()}`, {
    method: 'POST',
  });
}

export async function runModelTraining(datasetId, modelType = 'xgboost', targetColumn = null) {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    model_type: modelType,
  });
  if (targetColumn) params.append('target_column', targetColumn);

  return await request(`/api/training/run?${params.toString()}`, {
    method: 'POST',
  });
}

export async function getShapExplanation(datasetId, sampleType = 'malignant', targetColumn = null) {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    sample_type: sampleType,
  });
  if (targetColumn) params.append('target_column', targetColumn);

  return await request(`/api/predict/shap?${params.toString()}`);
}

// Predictions plus SHAP attributions for uploaded patients, using the
// already-trained models (no pipeline run needed)
export async function explainPatients(patients) {
  return await request('/api/predict/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patients }),
  });
}

// Rendered SHAP plots (waterfall for one patient, beeswarm across all uploaded patients)
export async function getPatientShapPlots(patients, patient) {
  return await request('/api/predict/explain/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patients, patient }),
  });
}

export async function getPcaProjection(datasetId, targetColumn = null) {
  const params = new URLSearchParams({ dataset_id: datasetId });
  if (targetColumn) params.append('target_column', targetColumn);

  return await request(`/api/dataset/pca-projection?${params.toString()}`);
}

export async function getFeatureNames() {
  return await request('/api/predict/feature-names');
}

export async function getPrediction(features) {
  return await request('/api/predict/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
}

