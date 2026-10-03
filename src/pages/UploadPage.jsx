import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  X,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Database,
  Table,
  Sliders,
  Info,
  Check,
  Split,
  FileText,
  AlertTriangle,
  Target,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ingestDatasetFiles, getSampleWDBC, getFeatureNames, explainPatients } from '../api/client';

const LABEL_COLUMN_NAMES = ['diagnosis', 'target', 'label', 'class', 'outcome'];

// Normalizes WDBC feature names so 'radius_mean' and 'mean radius' match the same feature
const canonicalFeatureName = (name) => {
  let n = name.trim().toLowerCase().replace(/[_\s]+/g, ' ');
  let m;
  if ((m = n.match(/^(.*) mean$/))) n = `mean ${m[1]}`;
  else if ((m = n.match(/^(.*) (se|error)$/))) n = `${m[1]} error`;
  else if ((m = n.match(/^(.*) worst$/))) n = `worst ${m[1]}`;
  return n;
};

// Sample Wisconsin Diagnostic Breast Cancer dataset baseline
const SAMPLE_WDBC_FEATURES = [
  'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean',
  'smoothness_mean', 'compactness_mean', 'concavity_mean', 'concave_points_mean',
  'symmetry_mean', 'fractal_dimension_mean', 'radius_se', 'texture_se',
  'perimeter_se', 'area_se', 'smoothness_se', 'compactness_se',
  'concavity_se', 'concave_points_se', 'symmetry_se', 'fractal_dimension_se',
  'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst',
  'smoothness_worst', 'compactness_worst', 'concavity_worst', 'concave_points_worst',
  'symmetry_worst', 'fractal_dimension_worst'
];

const SAMPLE_WDBC_DATA = [
  { Feature: 'radius_mean', Type: 'Numeric', Example: '17.99' },
  { Feature: 'texture_mean', Type: 'Numeric', Example: '10.38' },
  { Feature: 'perimeter_mean', Type: 'Numeric', Example: '122.8' },
  { Feature: 'area_mean', Type: 'Numeric', Example: '1001.0' },
  { Feature: 'smoothness_mean', Type: 'Numeric', Example: '0.1184' },
  { Feature: 'Diagnosis', Type: 'Categorical', Example: 'M (Malignant)' },
];

export default function UploadPage({ onContinueToPreprocessing, onViewPatientShap }) {
  // Upload mode: 'single' (full combined CSV) or 'split' (features.csv + target.csv)
  const [uploadMode, setUploadMode] = useState('single');

  // Single file state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Split files state
  const [featuresFile, setFeaturesFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [isDraggingFeatures, setIsDraggingFeatures] = useState(false);
  const [isDraggingTarget, setIsDraggingTarget] = useState(false);
  const [splitError, setSplitError] = useState(null);

  // Processed dataset metadata
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [targetColumn, setTargetColumn] = useState('Diagnosis');
  const [previewTab, setPreviewTab] = useState('schema');

  // Backend ingestion state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Patient test state (file with features only, no diagnosis column)
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState(null);
  const [testProgress, setTestProgress] = useState({ percent: 0, stage: '' });

  const fileInputRef = useRef(null);
  const featuresInputRef = useRef(null);
  const targetInputRef = useRef(null);

  // Helper to parse CSV string into rows and headers
  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map(line => {
      return line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    });
    return { headers, rows };
  };

  // Process single full CSV file
  const processSingleCSV = (fileObj) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSVText(e.target.result);
      if (!parsed) {
        alert("The uploaded CSV appears to be empty or missing data rows.");
        return;
      }
      const { headers, rows } = parsed;

      let missingCount = 0;
      rows.forEach(r => {
        r.forEach(val => {
          if (val === '' || val.toLowerCase() === 'nan' || val.toLowerCase() === 'null') {
            missingCount++;
          }
        });
      });

      const schema = headers.map((header, idx) => {
        const sampleValues = rows.slice(0, 20).map(r => r[idx]).filter(v => v !== undefined && v !== '');
        const isNumeric = sampleValues.every(val => !isNaN(parseFloat(val)) && isFinite(val));
        return {
          Feature: header,
          Type: isNumeric ? 'Numeric' : 'Categorical',
          Example: sampleValues[0] || 'N/A'
        };
      });

      const labelColumn = headers.find(h => LABEL_COLUMN_NAMES.includes(h.toLowerCase()));
      // No diagnosis column and only numeric measurements: these are patients to test, not training data
      const isPatientTest = !labelColumn && schema.every(col => col.Type === 'Numeric');

      setTargetColumn(labelColumn || headers[headers.length - 1]);
      setFile(fileObj);
      setTestError(null);
      setDatasetInfo({
        mode: 'single',
        isPatientTest,
        patientRows: isPatientTest ? rows : null,
        name: fileObj.name,
        sizeMb: (fileObj.size / (1024 * 1024)).toFixed(2),
        rowCount: rows.length,
        colCount: headers.length,
        headers: headers,
        schema: schema,
        rawPreview: rows.slice(0, 5).map(r => {
          const rowObj = {};
          headers.forEach((h, i) => { rowObj[h] = r[i]; });
          return rowObj;
        }),
        missingCount: missingCount
      });
    };
    reader.readAsText(fileObj);
  };

  // Process split files when both features and target are uploaded
  const processSplitCSVs = (fFile, tFile) => {
    setSplitError(null);
    const readerF = new FileReader();
    readerF.onload = (eF) => {
      const parsedF = parseCSVText(eF.target.result);
      if (!parsedF) {
        setSplitError("Features CSV is empty or has invalid format.");
        return;
      }

      const readerT = new FileReader();
      readerT.onload = (eT) => {
        const parsedT = parseCSVText(eT.target.result);
        if (!parsedT) {
          setSplitError("Target CSV is empty or has invalid format.");
          return;
        }

        // Validate row count match
        if (parsedF.rows.length !== parsedT.rows.length) {
          setSplitError(
            `Row count mismatch: features.csv has ${parsedF.rows.length} rows, but target.csv has ${parsedT.rows.length} rows. Both files must have matching sample lengths.`
          );
          return;
        }

        const targetHeaderName = parsedT.headers[0] || 'Target';
        const combinedHeaders = [...parsedF.headers, targetHeaderName];

        const combinedRows = parsedF.rows.map((row, idx) => {
          const targetVal = parsedT.rows[idx] ? parsedT.rows[idx][0] : '';
          return [...row, targetVal];
        });

        let missingCount = 0;
        combinedRows.forEach(r => {
          r.forEach(val => {
            if (val === '' || val.toLowerCase() === 'nan' || val.toLowerCase() === 'null') {
              missingCount++;
            }
          });
        });

        const schema = combinedHeaders.map((header, idx) => {
          const sampleValues = combinedRows.slice(0, 20).map(r => r[idx]).filter(v => v !== undefined && v !== '');
          const isNumeric = sampleValues.every(val => !isNaN(parseFloat(val)) && isFinite(val));
          return {
            Feature: header,
            Type: isNumeric ? 'Numeric' : 'Categorical',
            Example: sampleValues[0] || 'N/A'
          };
        });

        setTargetColumn(targetHeaderName);
        setDatasetInfo({
          mode: 'split',
          featuresName: fFile.name,
          targetName: tFile.name,
          featuresSizeMb: (fFile.size / (1024 * 1024)).toFixed(2),
          targetSizeMb: (tFile.size / (1024 * 1024)).toFixed(3),
          rowCount: combinedRows.length,
          colCount: combinedHeaders.length,
          headers: combinedHeaders,
          schema: schema,
          rawPreview: combinedRows.slice(0, 5).map(r => {
            const rowObj = {};
            combinedHeaders.forEach((h, i) => { rowObj[h] = r[i]; });
            return rowObj;
          }),
          missingCount: missingCount
        });
      };
      readerT.readAsText(tFile);
    };
    readerF.readAsText(fFile);
  };

  // Handle single file drop
  const handleSingleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.csv')) {
        processSingleCSV(droppedFile);
      } else {
        alert('Please upload a valid .CSV file.');
      }
    }
  };

  // Handle features file drop in split mode
  const handleFeaturesDrop = (e) => {
    e.preventDefault();
    setIsDraggingFeatures(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.toLowerCase().endsWith('.csv')) {
        setFeaturesFile(dropped);
        if (targetFile) {
          processSplitCSVs(dropped, targetFile);
        }
      } else {
        alert('Features file must be a .CSV.');
      }
    }
  };

  // Handle target file drop in split mode
  const handleTargetDrop = (e) => {
    e.preventDefault();
    setIsDraggingTarget(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.toLowerCase().endsWith('.csv')) {
        setTargetFile(dropped);
        if (featuresFile) {
          processSplitCSVs(featuresFile, dropped);
        }
      } else {
        alert('Target file must be a .CSV.');
      }
    }
  };

  // Sample demo loaders
  const handleLoadSplitSample = () => {
    const fMock = { name: 'breast_cancer_features.csv', size: 120670 };
    const tMock = { name: 'breast_cancer_target.csv', size: 1718 };
    setFeaturesFile(fMock);
    setTargetFile(tMock);
    setTargetColumn('Diagnosis');
    setDatasetInfo({
      mode: 'split',
      isSample: true,
      featuresName: 'breast_cancer_features.csv',
      targetName: 'breast_cancer_target.csv',
      featuresSizeMb: '0.12',
      targetSizeMb: '0.002',
      rowCount: 569,
      colCount: 31,
      headers: [...SAMPLE_WDBC_FEATURES, 'Diagnosis'],
      schema: SAMPLE_WDBC_DATA,
      rawPreview: [
        { radius_mean: '17.99', texture_mean: '10.38', perimeter_mean: '122.8', area_mean: '1001.0', smoothness_mean: '0.1184', Diagnosis: 'M' },
        { radius_mean: '20.57', texture_mean: '17.77', perimeter_mean: '132.9', area_mean: '1326.0', smoothness_mean: '0.0847', Diagnosis: 'M' },
        { radius_mean: '19.69', texture_mean: '21.25', perimeter_mean: '130.0', area_mean: '1203.0', smoothness_mean: '0.1096', Diagnosis: 'M' },
        { radius_mean: '11.42', texture_mean: '20.38', perimeter_mean: '77.58', area_mean: '386.1', smoothness_mean: '0.1425', Diagnosis: 'B' },
        { radius_mean: '20.29', texture_mean: '14.34', perimeter_mean: '135.1', area_mean: '1297.0', smoothness_mean: '0.1003', Diagnosis: 'M' },
      ],
      missingCount: 0
    });
  };

  const handleReset = () => {
    setFile(null);
    setFeaturesFile(null);
    setTargetFile(null);
    setDatasetInfo(null);
    setSplitError(null);
    setSubmitError(null);
    setTestError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (featuresInputRef.current) featuresInputRef.current.value = '';
    if (targetInputRef.current) targetInputRef.current.value = '';
  };

  // Send the dataset to the backend, then hand the stored dataset over to the pipeline
  const handleContinue = async () => {
    if (!datasetInfo || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let resp;
      if (datasetInfo.isSample) {
        resp = await getSampleWDBC();
      } else {
        const formData = new FormData();
        if (datasetInfo.mode === 'split') {
          formData.append('features_file', featuresFile);
          formData.append('target_file', targetFile);
        } else {
          formData.append('features_file', file);
        }
        resp = await ingestDatasetFiles(formData, targetColumn);
      }

      const ingested = {
        ...datasetInfo,
        id: resp.dataset_id,
        filename: resp.filename,
        rows: resp.dataset.rows,
        columns: resp.dataset.columns,
        features: resp.dataset.features,
        target_column: resp.dataset.target_column,
        target_classes: resp.dataset.target_classes,
        profile: resp.profile,
        validation: resp.validation
      };

      onContinueToPreprocessing && onContinueToPreprocessing(ingested, resp.dataset.target_column);
    } catch (err) {
      setSubmitError(err.message || 'Failed to upload the dataset to the backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run every patient row through the trained XGBoost and quantum models, with SHAP attributions
  const handleTestPatients = async () => {
    if (!datasetInfo?.isPatientTest || isTesting) return;
    setIsTesting(true);
    setTestError(null);
    setTestProgress({ percent: 5, stage: 'Loading model feature schema...' });
    let creep = null;

    try {
      const { features: featureNames } = await getFeatureNames();
      setTestProgress({ percent: 15, stage: 'Validating patient measurements...' });
      const headerIndex = {};
      datasetInfo.headers.forEach((h, i) => { headerIndex[canonicalFeatureName(h)] = i; });

      const missing = featureNames.filter(f => headerIndex[canonicalFeatureName(f)] === undefined);
      if (missing.length) {
        throw new Error(`The file is missing ${missing.length} required feature(s): ${missing.join(', ')}`);
      }

      const patients = datasetInfo.patientRows.map((row, idx) => {
        const features = featureNames.map(f => parseFloat(row[headerIndex[canonicalFeatureName(f)]]));
        if (features.some(v => !Number.isFinite(v))) {
          throw new Error(`Patient ${idx + 1} has missing or non-numeric values.`);
        }
        return features;
      });
      setTestProgress({ percent: 25, stage: 'Running XGBoost and quantum models, computing SHAP...' });
      // The backend reports no progress, so ease towards 90% while waiting
      creep = setInterval(() => {
        setTestProgress(p => ({ ...p, percent: p.percent + (90 - p.percent) * 0.08 }));
      }, 300);
      const explanation = await explainPatients(patients);
      clearInterval(creep);
      setTestProgress({ percent: 100, stage: 'Done. Opening results...' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Patient predictions and SHAP are shown on the Results page
      // File name, assessment time and (if the file has one) an age column, for the patient report
      const ageIndex = datasetInfo.headers.findIndex(h => canonicalFeatureName(h) === canonicalFeatureName('age'));
      const meta = {
        fileName: datasetInfo.name,
        assessedAt: new Date().toISOString(),
        ages: ageIndex === -1 ? null : datasetInfo.patientRows.map(row => parseFloat(row[ageIndex])),
      };
      onViewPatientShap && onViewPatientShap({ ...explanation, patients, meta }, 1);
    } catch (err) {
      setTestError(err.message || 'Patient test failed.');
    } finally {
      clearInterval(creep);
      setIsTesting(false);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pt-10 md:pt-14 pb-24">

        {/* =========================================================================
            1. PAGE HEADER
           ========================================================================= */}
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Ingestion Stage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-[#14211F] font-normal leading-tight tracking-tight">
            Upload Your Dataset
          </h1>

          <p className="mt-3 text-base sm:text-[17px] text-[#5B6664] max-w-2xl leading-relaxed">
            Upload a biomedical dataset in CSV format to begin the MAGI analysis pipeline.
          </p>

          <p className="mt-1 text-xs sm:text-[13px] text-[#717E7B] max-w-2xl">
            Your dataset will be validated and profiled before entering the preprocessing and model training stages.
          </p>
        </section>

        {/* =========================================================================
            UPLOAD MODE SELECTOR TABS (Single Full CSV vs. Split Features + Target)
           ========================================================================= */}
        {!datasetInfo && (
          <div className="mb-6 flex justify-center sm:justify-start">
            <div className="inline-flex p-1.5 bg-[#FFFFFF] rounded-xl border border-[#E7E5E0] shadow-xs">
              <button
                type="button"
                onClick={() => { setUploadMode('single'); handleReset(); }}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${uploadMode === 'single'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#5B6664] hover:text-[#14211F]'
                  }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Full CSV File</span>
              </button>

              <button
                type="button"
                onClick={() => { setUploadMode('split'); handleReset(); }}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${uploadMode === 'split'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#5B6664] hover:text-[#14211F]'
                  }`}
              >
                <Split className="w-4 h-4" />
                <span>Split Files (features.csv & target.csv)</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. MAIN UPLOAD AREA
           ========================================================================= */}
        {!datasetInfo ? (
          uploadMode === 'single' ? (
            /* --- OPTION A: SINGLE FULL CSV DROP ZONE --- */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleSingleDrop}
              className={`clinical-card bg-white p-10 sm:p-14 text-center rounded-[18px] border-2 border-dashed transition-all duration-200 ${isDragging
                  ? 'border-[#0F766E] bg-[#0F766E]/5 scale-[0.995]'
                  : 'border-[#E7E5E0] hover:border-[#D1CFCA]'
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && processSingleCSV(e.target.files[0])}
                accept=".csv"
                className="hidden"
                id="single-file-input"
              />

              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center mb-5 shadow-xs">
                  <FileText className="w-8 h-8 text-[#0F766E]" />
                </div>

                <h2 className="font-serif text-2xl text-[#14211F] mb-1 font-normal">
                  Upload Biomedical Dataset
                </h2>

                <p className="text-sm text-[#5B6664] mt-2 mb-3">
                  Drag & drop your CSV here
                </p>

                <span className="text-xs text-[#717E7B] uppercase tracking-wider mb-4 font-mono">
                  or
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="clinical-btn-primary cursor-pointer px-6 py-2.5 shadow-sm"
                >
                  <span>Browse Files</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- OPTION B: DUAL SPLIT FILES DROP ZONES --- */
            <div className="space-y-6">
              {splitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-[12px] flex items-start gap-3 text-red-800 text-xs leading-relaxed animate-clinical-fade">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{splitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Features File Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFeatures(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingFeatures(false); }}
                  onDrop={handleFeaturesDrop}
                  className={`clinical-card bg-white p-7 text-center rounded-[16px] border-2 border-dashed transition-all duration-200 flex flex-col justify-between ${isDraggingFeatures
                      ? 'border-[#0F766E] bg-[#0F766E]/5'
                      : featuresFile
                        ? 'border-[#0F766E]/40 bg-[#FAFAF7]'
                        : 'border-[#E7E5E0] hover:border-[#D1CFCA]'
                    }`}
                >
                  <input
                    type="file"
                    ref={featuresInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const f = e.target.files[0];
                        setFeaturesFile(f);
                        if (targetFile) processSplitCSVs(f, targetFile);
                      }
                    }}
                    accept=".csv"
                    className="hidden"
                  />

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#FAFAF7] border border-[#E7E5E0] mx-auto flex items-center justify-center mb-3 shadow-xs">
                      <Table className="w-6 h-6 text-[#0F766E]" />
                    </div>
                    <div className="text-[11px] font-mono uppercase font-semibold text-[#0F766E] mb-1">
                      Step 1 of 2
                    </div>
                    <h3 className="font-serif text-xl text-[#14211F] mb-1">
                      Features File (X)
                    </h3>
                    <p className="text-xs text-[#5B6664] mb-4">
                      Continuous patient biomarker columns (e.g. <code>features.csv</code>)
                    </p>
                  </div>

                  <div>
                    {featuresFile ? (
                      <div className="p-3 bg-white rounded-lg border border-[#0F766E]/30 text-xs font-mono text-[#0F766E] flex items-center justify-between mb-3">
                        <span className="truncate">{featuresFile.name}</span>
                        <Check className="w-4 h-4 shrink-0 text-[#0F766E]" />
                      </div>
                    ) : (
                      <p className="text-xs text-[#717E7B] mb-3">Drag & drop features CSV here</p>
                    )}

                    <button
                      type="button"
                      onClick={() => featuresInputRef.current && featuresInputRef.current.click()}
                      className="clinical-btn-secondary text-xs px-4 py-2 w-full cursor-pointer"
                    >
                      <span>{featuresFile ? 'Change Features File' : 'Browse features.csv'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Target File Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingTarget(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingTarget(false); }}
                  onDrop={handleTargetDrop}
                  className={`clinical-card bg-white p-7 text-center rounded-[16px] border-2 border-dashed transition-all duration-200 flex flex-col justify-between ${isDraggingTarget
                      ? 'border-[#0F766E] bg-[#0F766E]/5'
                      : targetFile
                        ? 'border-[#0F766E]/40 bg-[#FAFAF7]'
                        : 'border-[#E7E5E0] hover:border-[#D1CFCA]'
                    }`}
                >
                  <input
                    type="file"
                    ref={targetInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const t = e.target.files[0];
                        setTargetFile(t);
                        if (featuresFile) processSplitCSVs(featuresFile, t);
                      }
                    }}
                    accept=".csv"
                    className="hidden"
                  />

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#FAFAF7] border border-[#E7E5E0] mx-auto flex items-center justify-center mb-3 shadow-xs">
                      <Target className="w-6 h-6 text-[#0F766E]" />
                    </div>
                    <div className="text-[11px] font-mono uppercase font-semibold text-[#0F766E] mb-1">
                      Step 2 of 2
                    </div>
                    <h3 className="font-serif text-xl text-[#14211F] mb-1">
                      Target Labels (y)
                    </h3>
                    <p className="text-xs text-[#5B6664] mb-4">
                      Single ground-truth diagnosis class column (e.g. <code>target.csv</code>)
                    </p>
                  </div>

                  <div>
                    {targetFile ? (
                      <div className="p-3 bg-white rounded-lg border border-[#0F766E]/30 text-xs font-mono text-[#0F766E] flex items-center justify-between mb-3">
                        <span className="truncate">{targetFile.name}</span>
                        <Check className="w-4 h-4 shrink-0 text-[#0F766E]" />
                      </div>
                    ) : (
                      <p className="text-xs text-[#717E7B] mb-3">Drag & drop target CSV here</p>
                    )}

                    <button
                      type="button"
                      onClick={() => targetInputRef.current && targetInputRef.current.click()}
                      className="clinical-btn-secondary text-xs px-4 py-2 w-full cursor-pointer"
                    >
                      <span>{targetFile ? 'Change Target File' : 'Browse target.csv'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample baseline loader for split mode */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadSplitSample}
                  className="text-xs font-medium text-[#0F766E] hover:text-[#0D655E] underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Need sample split data? Load Wisconsin Split Baseline (features.csv + target.csv)
                </button>
              </div>
            </div>
          )
        ) : (
          /* =========================================================================
              3. TRANSFORMED STATE AFTER FILE SELECTION (Confirmed State)
             ========================================================================= */
          <div className="space-y-8 animate-clinical-fade">
            {/* Confirmed File Pill Card */}
            <div className="clinical-card bg-white p-6 sm:p-7 rounded-[16px] border border-[#E7E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] shrink-0">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base text-[#14211F]">
                      {datasetInfo.mode === 'split'
                        ? `${datasetInfo.featuresName} + ${datasetInfo.targetName}`
                        : datasetInfo.name}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E]">
                      {datasetInfo.mode === 'split' ? 'Split Aligned' : 'Validated'}
                    </span>
                  </div>
                  <div className="text-xs text-[#5B6664] mt-1 font-mono flex items-center gap-3 flex-wrap">
                    <span>
                      {datasetInfo.mode === 'split'
                        ? `${datasetInfo.featuresSizeMb} MB features • ${datasetInfo.targetSizeMb} MB target`
                        : `${datasetInfo.sizeMb} MB`}
                    </span>
                    <span>•</span>
                    <span>{datasetInfo.rowCount} rows</span>
                    <span>•</span>
                    <span>{datasetInfo.colCount} columns</span>
                  </div>
                </div>
              </div>

              {/* Remove / Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                className="clinical-btn-secondary text-xs px-4 py-2 border-[#E7E5E0] hover:text-red-700 hover:border-red-200 self-start sm:self-center cursor-pointer"
              >
                <span>Remove</span>
              </button>
            </div>

            {/* =========================================================================
                4. DATASET PREVIEW (FIRST 5–10 ROWS / SCHEMA)
               ========================================================================= */}
            <div className="clinical-card bg-white p-6 sm:p-8 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#14211F] mb-1">
                    Dataset Preview
                  </h3>
                  <p className="text-xs text-[#5B6664]">
                    Displaying sample rows and detected feature modalities.
                  </p>
                </div>

                {/* View Switcher Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#FAFAF7] rounded-lg border border-[#E7E5E0] self-start sm:self-auto">
                  <button
                    onClick={() => setPreviewTab('schema')}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors cursor-pointer ${previewTab === 'schema'
                        ? 'bg-white text-[#14211F] shadow-xs'
                        : 'text-[#5B6664] hover:text-[#14211F]'
                      }`}
                  >
                    Feature Schema
                  </button>
                  <button
                    onClick={() => setPreviewTab('raw')}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors cursor-pointer ${previewTab === 'raw'
                        ? 'bg-white text-[#14211F] shadow-xs'
                        : 'text-[#5B6664] hover:text-[#14211F]'
                      }`}
                  >
                    Raw Data (Top 5)
                  </button>
                </div>
              </div>

              {/* Schema Table View */}
              {previewTab === 'schema' && (
                <div className="overflow-x-auto rounded-[10px] border border-[#E7E5E0]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAF7] border-b border-[#E7E5E0] text-[#5B6664]">
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Feature</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Type</th>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Example Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA] text-[#14211F]">
                      {datasetInfo.schema.slice(0, 8).map((col, idx) => (
                        <tr key={idx} className="hover:bg-[#FAFAF7]/60 transition-colors">
                          <td className="py-2 px-4 font-mono font-medium">{col.Feature}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${col.Type === 'Numeric'
                                ? 'bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20'
                                : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20'
                              }`}>
                              {col.Type}
                            </span>
                          </td>
                          <td className="py-2 px-4 font-mono text-[#5B6664]">{col.Example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Raw Table View */}
              {previewTab === 'raw' && (
                <div className="overflow-x-auto rounded-[10px] border border-[#E7E5E0]">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#FAFAF7] border-b border-[#E7E5E0] text-[#5B6664]">
                        {datasetInfo.headers.slice(0, 6).map((h, i) => (
                          <th key={i} className="py-2.5 px-4 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA] text-[#14211F]">
                      {datasetInfo.rawPreview.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#FAFAF7]/60 transition-colors">
                          {datasetInfo.headers.slice(0, 6).map((h, cIdx) => (
                            <td key={cIdx} className="py-2 px-4 whitespace-nowrap text-[#5B6664]">
                              {row[h] !== undefined ? String(row[h]) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* =========================================================================
                5. DATASET VALIDATION (DATASET PROFILE STATUS CARD)
               ========================================================================= */}
            <div className="clinical-card bg-white p-6 sm:p-8 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-2xl text-[#14211F]">
                  Dataset Profile
                </h3>
                <span className="text-xs font-mono text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-0.5 rounded-full border border-[#0F766E]/20">
                  {datasetInfo.isPatientTest ? 'Ready for Testing' : 'Ready for Benchmarks'}
                </span>
              </div>

              {/* Profile Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">File format</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#14211F]">
                    {datasetInfo.mode === 'split' ? 'Dual CSV (Split)' : 'CSV'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">Dataset loaded</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#14211F]">{datasetInfo.rowCount} {datasetInfo.isPatientTest ? (datasetInfo.rowCount === 1 ? 'patient' : 'patients') : 'samples'}</span>
                </div>

                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">Features</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#14211F]">{datasetInfo.isPatientTest ? datasetInfo.colCount : datasetInfo.colCount - 1}</span>
                </div>

                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">{datasetInfo.isPatientTest ? 'Diagnosis column' : 'Target detected'}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#0F766E]">{datasetInfo.isPatientTest ? 'None (to predict)' : targetColumn}</span>
                </div>

                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">Missing values</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#14211F]">{datasetInfo.missingCount}</span>
                </div>

                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span className="text-xs font-medium text-[#5B6664]">Type balance</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#14211F]">Binary Tabular</span>
                </div>
              </div>
            </div>

            {datasetInfo.isPatientTest ? (
            /* =========================================================================
                6. PATIENT TEST (features only, no diagnosis column)
               ========================================================================= */
            <div className="clinical-card bg-white p-6 sm:p-8 rounded-[16px] border border-[#E7E5E0] space-y-5">
              <div>
                <h3 className="font-serif text-2xl text-[#14211F] mb-1">
                  Test Patient{datasetInfo.rowCount === 1 ? '' : 's'}
                </h3>
                <p className="text-xs text-[#5B6664]">
                  This file has no diagnosis column, so each row is treated as a patient to test. MAGI predicts whether each patient is malignant or benign using the trained XGBoost and quantum (VQC) models, then opens the Results page with the SHAP explanation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestPatients}
                disabled={isTesting}
                className={`clinical-btn-primary group px-7 py-3 w-full sm:w-auto ${isTesting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <span>Run Patient Test</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {isTesting && (
                <div className="space-y-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(testProgress.percent)}>
                  <div className="flex justify-between text-[11px] font-mono text-[#5B6664]">
                    <span>{testProgress.stage}</span>
                    <span>{Math.round(testProgress.percent)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0F766E] transition-all duration-300 ease-out"
                      style={{ width: `${testProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#717E7B]">The first run can take ~30s while the models load.</p>
                </div>
              )}

              {testError && (
                <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Patient test failed: {testError}</span>
                </div>
              )}

            </div>
            ) : (
            <>
            {/* =========================================================================
                6. TARGET SELECTION
               ========================================================================= */}
            <div className="clinical-card bg-white p-6 sm:p-8 rounded-[16px] border border-[#E7E5E0]">
              <div className="max-w-xl">
                <h3 className="font-serif text-2xl text-[#14211F] mb-1">
                  Select Target Variable
                </h3>
                <p className="text-xs text-[#5B6664] mb-4">
                  Select the column you want the models to predict.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label htmlFor="target-select" className="text-xs font-medium text-[#14211F] whitespace-nowrap">
                    Target variable:
                  </label>
                  <div className="relative w-full sm:w-72">
                    <select
                      id="target-select"
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      className="w-full appearance-none bg-[#FAFAF7] border border-[#E7E5E0] rounded-[10px] px-3.5 py-2 text-xs font-mono font-medium text-[#14211F] focus:outline-none focus:border-[#0F766E] transition-colors pr-9 cursor-pointer"
                    >
                      {datasetInfo.headers.map((h, i) => (
                        <option key={i} value={h}>{h}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#5B6664] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-[#717E7B]">
                  <Info className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Auto-detected target: <strong>{targetColumn}</strong> (Pre-selected based on schema analysis)</span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                7. CONTINUE BUTTON & PIPELINE PROGRESSION
               ========================================================================= */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#E7E5E0]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#5B6664] overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <span className="font-semibold text-[#0F766E] px-2 py-0.5 rounded bg-[#0F766E]/10">UPLOAD</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A3ADAB]" />
                <span className="text-[#14211F] font-medium">DATA PROFILE</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A3ADAB]" />
                <span className="text-[#717E7B]">PREPROCESSING</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A3ADAB]" />
                <span className="text-[#717E7B]">TRAINING</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A3ADAB]" />
                <span className="text-[#717E7B]">BENCHMARKING</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A3ADAB]" />
                <span className="text-[#717E7B]">RESULTS</span>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className={`clinical-btn-primary group px-7 py-3 w-full sm:w-auto ${isSubmitting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading dataset...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Preprocessing</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Dataset upload failed: {submitError}</span>
              </div>
            )}
            </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
