const API_BASE = '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errDetail = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || JSON.stringify(errJson);
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

export async function ingestDatasetFiles(formData) {
  return await request('/api/dataset/ingest', {
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

export async function getShapExplanation(sampleType = 'malignant') {
  return await request(`/api/predict/shap?sample_type=${sampleType}`);
}

export async function getPrediction(features) {
  return await request('/api/predict/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
}

