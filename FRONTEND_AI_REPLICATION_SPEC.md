# Frontend Replication Master Blueprint & System Specification
## Project: SIH26139 — Hybrid Quantum-Classical Clinical Research Platform (QuantumDx)

> **Purpose of this Document**: This document is an exhaustive, self-contained specification designed to be handed to an AI coding assistant or engineering team to build the exact identical frontend application from scratch. Every design token, typography setting, component specification, animation detail, context architecture, API integration contract, and interaction behavior is documented with zero omissions.

---

## 1. Executive Summary & Tech Stack

The application, **QuantumDx (SIH26139)**, is a clinical editorial web application designed for biomedical research, empirical quantum machine learning benchmarking (Classical XGBoost vs. 4-Qubit Variational Quantum Classifier vs. Quantum-Classical Hybrid Ensembles), dataset profiling, and patient case inference.

### Core Technology Stack

| Technology | Version / Specification | Purpose |
| :--- | :--- | :--- |
| **Framework** | **React 19** (`^19.2.8` / `react-dom ^19.2.8`) | Modern component architecture, hooks, StrictMode compatibility |
| **Build Tool** | **Vite 6 / 8** (`^8.2.2` with `@vitejs/plugin-react ^6.1.0`) | Lightning-fast HMR and ESM bundling |
| **Routing** | **React Router DOM v7** (`^7.18.4`) | Dynamic parameterized routing (`/`, `/dashboard`, `/technology`, `/pipeline/:id`, `/results/:id`) |
| **Styling** | **Tailwind CSS v4** (`^4.3.3` with `@tailwindcss/vite`) + Custom CSS variables | Precision styling with editorial design tokens |
| **Smooth Scrolling** | **Lenis** (`^1.3.26`) | Inertial momentum smooth scrolling |
| **Scroll Triggers** | **GSAP & ScrollTrigger** (`^3.15.0`) | Route-change scroll trigger management and refresh cycles |
| **Animations** | **Framer Motion** (`^13.4.1`) | Route transitions, navbar active pills, fade/slide animations |
| **Iconography** | **Lucide React** (`^1.41.0`) | Ultra-clean 1.5px stroke medical & quantum icons |

---

## 2. Design System, Color Palette, Typography & Global CSS

The design language is **Clinical Editorial Research** — a high-trust, scholarly aesthetic inspired by prestigious scientific journals (Nature, Lancet, NEJM) paired with modern UI precision. It completely avoids dark sci-fi neon/glowing tropes in favor of a warm, paper-like clinical aesthetic.

### 2.1 CSS Custom Properties & Color Tokens

```css
:root {
  /* Surfaces & Backgrounds */
  --bg-base: #FAFAF7;       /* Warm clinical paper off-white */
  --bg-surface: #FFFFFF;    /* Pure crisp white card surface */
  --border: #E7E5E0;        /* Subtle warm gray divider */
  --border-hover: #D1CFCA;  /* Darker border for hover interactions */

  /* Text & Ink */
  --text-primary: #14211F;   /* Deep clinical ink black/forest */
  --text-secondary: #5B6664; /* Scholarly muted slate gray */

  /* Semantic Accents */
  --accent: #0F766E;        /* Deep surgical teal / primary brand accent */
  --accent-hover: #0D655E;  /* Darker teal for button hovers */
  --accent-active: #0B534E; /* Darkest teal for active button states */
  --alert: #B45309;         /* Warm amber/rust for warnings, malignant indicators */

  /* Typography Families */
  --font-heading: 'Instrument Serif', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### 2.2 Typography Rules & Hierarchy

- **Google Fonts Import**:
  - `Instrument Serif`: `ital@0;1` (Headings, titles, large metric values).
  - `Inter`: `wght@400;500;600` (Body, UI controls, navigation, data tables).
- **Headings**:
  - `h1`: `font-family: var(--font-heading); font-weight: 400; font-size: clamp(2.5rem, 5vw, 3.75rem); line-height: 1.1; letter-spacing: -0.01em; color: var(--text-primary);`
  - `h2`: `font-family: var(--font-heading); font-weight: 400; font-size: 2.25rem; line-height: 1.2; letter-spacing: -0.01em;`
  - `h3`: `font-family: var(--font-heading); font-weight: 400; font-size: 1.5rem; line-height: 1.3;`
  - In card headers / section subheads: Sans-serif font (`font-sans font-semibold text-sm` or `text-base`).
- **Body Text**:
  - Regular body: `font-family: var(--font-body); font-size: 17px; line-height: 1.6; color: var(--text-secondary); max-width: 65ch;`
- **Numbers & Metrics**:
  - Always use tabular numbers: `font-variant-numeric: tabular-nums; font-family: var(--font-body)` or `var(--font-heading)`.

### 2.3 Layout & Container Constraints

- **Main Container Width**: Strictly `max-w-[1100px] mx-auto px-4 sm:px-6`.
- **Card Border Radius**: Standard `rounded-[12px]`, internal sub-elements `rounded-[8px]`, pills `rounded-full` or `rounded-[12px]`.
- **Borders**: Clean 1px solid `#E7E5E0`.
- **Shadows**: Minimal to none (`shadow-xs` only).

### 2.4 Complete `src/index.css`

```css
@import "tailwindcss";

@layer base {
  :root {
    --bg-base: #FAFAF7;
    --bg-surface: #FFFFFF;
    --border: #E7E5E0;
    --text-primary: #14211F;
    --text-secondary: #5B6664;
    --accent: #0F766E;
    --alert: #B45309;

    --font-heading: 'Instrument Serif', Georgia, serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  html {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }

  h1, h2, h3, .font-serif {
    font-family: var(--font-heading);
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  h1 {
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    line-height: 1.1;
  }

  h2 {
    font-size: 2.25rem;
    line-height: 1.2;
  }

  h3 {
    font-size: 1.5rem;
    line-height: 1.3;
  }

  .font-tabular,
  .tabular-nums {
    font-family: var(--font-body);
    font-variant-numeric: tabular-nums;
  }

  .text-editorial-max {
    max-width: 65ch;
  }
}

/* Clinical Component Classes */
.clinical-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color 200ms ease;
}

.clinical-card-interactive {
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color 200ms ease, background-color 200ms ease;
}

.clinical-card-interactive:hover {
  border-color: #D1CFCA;
}

.clinical-btn-primary {
  background-color: var(--accent);
  color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid var(--accent);
  font-family: var(--font-body);
  font-weight: 500;
  transition: opacity 200ms ease, background-color 200ms ease;
}

.clinical-btn-primary:hover {
  background-color: #0D655E;
}

.clinical-btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: var(--font-body);
  font-weight: 500;
  transition: border-color 200ms ease, background-color 200ms ease;
}

.clinical-btn-secondary:hover {
  border-color: #D1CFCA;
  background-color: #F4F4F0;
}

.clinical-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: 9999px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.clinical-input {
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: var(--font-body);
  outline: none;
  transition: border-color 200ms ease;
}

.clinical-input:focus {
  border-color: var(--accent);
}

@keyframes clinicalFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-clinical-fade {
  animation: clinicalFadeIn 250ms ease-out forwards;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-base);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #D1CFCA;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## 3. Complete File & Directory Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   ├── index.js
    │   ├── client.js
    │   ├── normalizers.js
    │   ├── datasetApi.js
    │   ├── trainingApi.js
    │   ├── benchmarkApi.js
    │   ├── experimentApi.js
    │   └── predictApi.js
    ├── context/
    │   ├── CaseContext.jsx
    │   ├── ResearchContext.jsx
    │   └── ThemeContext.jsx
    ├── data/
    │   └── benchmarkData.js
    ├── utils/
    │   └── scrollHelper.js
    └── components/
        ├── layout/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── AmbientBackground.jsx
        ├── ui/
        │   ├── Button.jsx
        │   └── ErrorBoundary.jsx
        ├── visual/
        │   ├── ConfusionMatrix.jsx
        │   ├── PcaScatterPlot.jsx
        │   ├── PcaScreeChart.jsx
        │   └── RocCurveChart.jsx
        ├── workspace/
        │   ├── UploadZone.jsx
        │   ├── DatasetSummaryCard.jsx
        │   ├── ResearchSetupView.jsx
        │   ├── ResearchPipelineView.jsx
        │   └── ResearchHistorySection.jsx
        ├── landing/
        │   ├── HomePage.jsx
        │   ├── DashboardPage.jsx
        │   ├── LandingPage.jsx
        │   ├── LandingHero.jsx
        │   ├── DashboardOverview.jsx
        │   ├── DemoSection.jsx
        │   ├── ModelsSection.jsx
        │   ├── WorkflowSection.jsx
        │   └── AboutSection.jsx
        ├── results/
        │   ├── ResultsWorkspaceView.jsx
        │   ├── ModelComparisonCard.jsx
        │   ├── ExplainabilityCard.jsx
        │   └── QuantumCircuitCard.jsx
        └── technology/
            └── TechnologyPage.jsx
```

---

## 4. State Management Architecture

The application uses **React Context API** with three dedicated contexts:

### 4.1 `CaseContext.jsx` (Active Patient / Case Tracking)
- **State**:
  - `activeCase`: `{ id: string | number, view: 'pipeline' | 'results' } | null`
- **Storage**: Persisted in `sessionStorage.getItem('sih26139_active_case')`.
- **Methods**:
  - `setActiveCase(caseData)`: Updates state and writes JSON to `sessionStorage`.
  - `clearActiveCase()`: Clears active case and removes key.
- **UI Integration**: Displays the active case pill on desktop & mobile navbar (`Case #40f003e3 · Pipeline`) with a quick-navigate and close button.

### 4.2 `ThemeContext.jsx` (Theme Management)
- **State**: `theme: 'light' | 'dark'` (Default: checks `localStorage.getItem('quantumdx_theme')` or `prefers-color-scheme`).
- **Methods**: `setTheme(theme)`, `toggleTheme()`.
- **Effect**: Appends or removes `dark`/`light` class on `document.documentElement`.

### 4.3 `ResearchContext.jsx` (Core Experiment Orchestrator)
- **Session Storage Key**: `quantumdx_research_session_v1`.
- **State Fields**:
  - `isBackendOnline`: `boolean` (checked via `apiClient.checkHealth()`).
  - `datasetId`, `datasetInfo`, `profile`, `validation`, `preprocessing`.
  - `trainedModels`: Map `{ xgboost?: ModelResult, vqc?: ModelResult, hybrid?: ModelResult }`.
  - `activeExperimentId`: `string | number | null`.
  - `isTrainingInProgress`: `boolean` (Strict guard against duplicate calls).
  - `currentTrainingModel`: `'xgboost' | 'vqc' | 'hybrid' | null`.
  - `modelTrainingStates`:
    ```js
    {
      xgboost: { status: 'idle'|'training'|'completed'|'failed', result: null, timeElapsed: 0, error: null },
      vqc: { status: 'idle'|'training'|'completed'|'failed', result: null, timeElapsed: 0, error: null },
      hybrid: { status: 'idle'|'training'|'completed'|'failed', result: null, timeElapsed: 0, error: null },
    }
    ```
  - `benchmark`: 5-fold CV benchmark results object.
  - `benchmarkComparison`: Classical vs. Quantum difference statistics.
  - `experimentHistory`: Array of saved SQLite experiment runs.
  - `pipelineState`: `'idle' | 'ingesting' | 'validating' | 'profiling' | 'preprocessing' | 'training_classical' | 'training_vqc' | 'training_hybrid' | 'completed' | 'failed'`.
  - `activePipelineStep`: Numeric index (`0` to `11`).
  - `error`: Error message string or null.
- **Key Methods**:
  - `uploadAndIngestDataset(featuresFile, targetFile?, targetColumn?)`: Handles single or dual CSV uploads. Normalizes dataset response, profiles column types, validates invariants.
  - `runPreprocessing(customDatasetId?, nComponents=4, varianceThreshold=0.0)`: Invokes StandardScaler, VarianceThreshold, PCA subspace dimensionality reduction.
  - `runModelTraining(modelType, customDatasetId?)`: Trains individual model with concurrency lock.
  - `runFullPipeline(targetId?, { onLog })`: Executes the real deterministic 4-step pipeline sequentially:
    1. Preprocessing & PCA (4 components)
    2. Classical XGBoost training
    3. Variational Quantum Classifier (4-qubit circuit simulation on PennyLane)
    4. Quantum-Classical Soft-Voting Fusion
    5. Refresh empirical benchmarks and SQLite database
  - `loadHistoricalExperiment(expRecord)`: Loads a past SQLite experiment run and populates workspace metrics.
  - `resetSession()`: Purges session storage and resets all states to baseline.

---

## 5. API Layer & Data Normalization Contracts

### 5.1 `api/client.js`
- Base URL configured from `import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'`.
- Supports `get(endpoint, { timeout, signal, headers })`, `post(endpoint, body, { timeout, signal, headers })`, and `postMultipart(endpoint, formData, { timeout, signal })`.
- Handles `AbortSignal.timeout`, JSON error normalization (handling FastAPI `detail` strings, array objects, and custom payloads).
- Provides `checkHealth()` pinging `/api/health`.

### 5.2 API Services Overview

| File | Endpoints | Functions |
| :--- | :--- | :--- |
| `datasetApi.js` | `GET /api/dataset/`<br>`POST /api/dataset/profile`<br>`POST /api/dataset/validate`<br>`POST /api/dataset/ingest`<br>`POST /api/dataset/preprocess` | `getDatasets()`, `profileDataset(file)`, `validateDataset(file, targetCol)`, `ingestDataset(feat, targ?, targetCol?)`, `preprocessDataset(id, nComp, varThresh)` |
| `trainingApi.js` | `POST /api/training/run?dataset_id=...&model_type=...` | `runTraining(datasetId, modelType)` (timeouts: 45s for XGBoost, 360s for VQC) |
| `benchmarkApi.js`| `GET /api/benchmark/`<br>`GET /api/benchmark/comparison`<br>`GET /api/benchmark/summary`<br>`GET /api/benchmark/database` | `getBenchmark()`, `getBenchmarkComparison()`, `getBenchmarkSummary()`, `getBenchmarkDatabase()` |
| `experimentApi.js`| `GET /api/experiments/`<br>`GET /api/experiments/{id}` | `getExperiments()`, `getExperiment(id)` |
| `predictApi.js` | `POST /api/predict`<br>`GET /api/metrics` | `predict(payload)` (patient inference), `getMetrics()` |

### 5.3 Normalizers (`api/normalizers.js`)
All incoming API payloads MUST be transformed through normalizers to ensure resilient UI rendering (handling fractional floats vs. percentages, snake_case vs. camelCase):
- `normalizeDataset(raw)`: maps `{ id, filename, rows, columns, features, targetColumn, targetClasses }`.
- `normalizeProfile(raw)`: maps `{ filename, rows, columns, columnNames, missingValues, numericColumns, categoricalColumns, isClean }`.
- `normalizeValidation(raw)`: maps `{ valid, errors, warnings, duplicateRows, missingValues, constantColumns, targetColumn, targetClasses, status }`.
- `normalizePreprocessing(raw)`: maps `{ trainShape, testShape, trainRows, testRows, originalFeatures, selectedFeatures, removedFeatures, pcaComponents, explainedVarianceRatio, totalExplainedVariance, totalExplainedVariancePercent, angleRange }`.
- `normalizeModelResult(raw)`: maps metrics `{ modelType, accuracy, f1, sensitivity, specificity, rocAuc, precision, trainingTime, inferenceTime, confusionMatrix: { tn, fp, fn, tp }, experimentId }`.
- `normalizeBenchmark(raw)`: maps models array and comparison object.
- `normalizeExperimentRecord(raw)`: maps SQLite database rows to standardized entity.

---

## 6. Routing, Navigation & Smooth Scrolling

### 6.1 Route Configuration (`App.jsx`)

```jsx
<Routes>
  {/* Landing / Home Page */}
  <Route path="/" element={<HomePage onTryDemo={handleTryDemo} />} />

  {/* Main Continuous Dashboard */}
  <Route path="/dashboard" element={<DashboardPage onContinueToPipeline={handleContinueToPipeline} onViewReport={handleViewReport} onExploreTech={handleExploreTech} />} />

  {/* Technical Deep Dive */}
  <Route path="/technology" element={<TechnologyPage onGoToDashboard={handleGoToDashboard} />} />

  {/* Real-Time Processing & Execution Pipeline */}
  <Route path="/pipeline/:id" element={<PipelineRouteWrapper onBackToDashboard={handleBackToDashboard} onOpenResults={handleOpenResults} />} />

  {/* Results & Empirical Visualization Workspace */}
  <Route path="/results/:id" element={<ResultsRouteWrapper onBackToDashboard={handleBackToDashboard} onViewPipeline={handleViewPipeline} onRestartExperiment={handleRestartExperiment} />} />

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### 6.2 Lenis Smooth Scrolling & GSAP ScrollTrigger Integration
1. **Lenis Initialization**:
   - `new Lenis({ duration: 1.0, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })`.
   - Exposed to `window.lenis`.
   - Animation frame hooked to `requestAnimationFrame(raf)`.
2. **GSAP ScrollTrigger**:
   - Registered via `gsap.registerPlugin(ScrollTrigger)`.
   - On route change: kills all active ScrollTriggers, refreshes after a 150ms timeout.
3. **Scroll Helper (`utils/scrollHelper.js`)**:
   - Calculates `-64px` sticky navbar offset.
   - Pushes hash to browser history via `window.history.pushState(null, '', '#sectionId')` without jarring jumps.
   - Supports `prefers-reduced-motion`.
4. **Scroll Restoration**:
   - Preserves vertical scroll position (`sih26139_dashboard_scroll_y`) when leaving and returning to `/dashboard`.

---

## 7. Component Specifications & UI Details

### 7.1 Layout Components

#### `Navbar.jsx`
- **Height**: `h-16` (64px), sticky `top-0 z-50 bg-[#FAFAF7]`.
- **Scroll Detection**: Detects `window.scrollY > 8` to dynamically toggle `border-b border-[#E7E5E0]`.
- **Navigation Links**:
  - `Home` (`/`)
  - `Upload` (`/dashboard#upload`)
  - `History` (`/dashboard#history`)
  - `Models` (`/dashboard#models`)
  - `Technology` (`/technology`)
  - `About` (`/dashboard#about`)
- **Active Indicator**: Uses Framer Motion `layoutId="navbar-active-indicator"` (2px height, `#0F766E`, spring transition).
- **Active Case Pill**:
  - Shows when `activeCase` is present in `CaseContext`.
  - Format: `● Case #{id} · Pipeline/Results` with an `X` dismiss button.
- **CTA Button**: Always-visible "New analysis" button (`Plus` icon, jumps to `#upload`).
- **Mobile Menu**: Responsive full-width slide down with backdrop below 768px.

#### `Footer.jsx`
- Clean editorial 3-line footer with `#E7E5E0` top border:
  1. `Developed by Team QuantumDx` (font-medium `#14211F`)
  2. `SIH26139: Hybrid Quantum-Classical Model for Early Disease Detection`
  3. `Inquiries & Research Audit: research@sih26139-quantumdx.gov.in`

#### `AmbientBackground.jsx`
- `fixed inset-0 pointer-events-none z-0 bg-[#FAFAF7]`. Zero glow, zero neon artifacts.

---

### 7.2 UI & Visualization Components

#### `Button.jsx`
- **Variants**:
  - `primary`: `bg-[#0F766E] text-white hover:bg-[#0D655E] active:bg-[#0B534E] border border-[#0F766E]`
  - `secondary`: `bg-[#FFFFFF] text-[#14211F] border border-[#E7E5E0] hover:border-[#D1CFCA] hover:bg-[#F4F4F0] active:bg-[#ECEBE6]`
  - `outline`: `bg-transparent text-[#14211F] border border-[#E7E5E0] hover:border-[#D1CFCA] hover:bg-[#FFFFFF]`
  - `ghost`: `bg-transparent text-[#5B6664] hover:text-[#14211F] hover:bg-[#F4F4F0]`
  - `alert`: `bg-[#B45309] text-white hover:bg-[#9A4608] border border-[#B45309]`
- **Sizes**:
  - `sm`: `text-xs px-3 py-1.5 rounded-[12px] h-8`
  - `md`: `text-sm px-4 py-2 rounded-[12px] h-10`
  - `lg`: `text-base px-6 py-3 rounded-[12px] h-12`
- **Props**: `children`, `variant`, `size`, `icon`, `iconPosition ('left'|'right')`, `loading`, `disabled`, `onClick`, `className`.

#### `ConfusionMatrix.jsx`
- **Purpose**: Displays 2x2 contingency matrix for 114 held-out test samples.
- **Model Selector Tabs**: `XGBoost`, `VQC`, `Hybrid`.
- **Ground Truth Numbers**:
  - **XGBoost**: TP=39, FN=3, TN=72, FP=0 (Accuracy: 97.37%, Sensitivity: 92.86%, Specificity: 100.0%)
  - **VQC**: TP=34, FN=8, TN=72, FP=0 (Accuracy: 92.98%, Sensitivity: 80.95%, Specificity: 100.0%)
  - **Hybrid**: TP=38, FN=4, TN=72, FP=0 (Accuracy: 96.49%, Sensitivity: 90.48%, Specificity: 100.0%)
- **Derived Formulas Panel**: Displays exact calculated Accuracy, Sensitivity (Recall), and Specificity.

#### `PcaScatterPlot.jsx`
- **Purpose**: 2D SVG Scatter Plot of PC1 vs. PC2 showing tumor cluster separation.
- **Dimensions**: `viewBox="0 0 500 260"`.
- **Visuals**:
  - Malignant Points: `#B45309` (Amber)
  - Benign Points: `#0F766E` (Teal)
  - Hyperplane Decision Boundary: Dashed line from `(-0.5, -4)` to `(1.2, 4)`.
  - Hover tooltip displaying Case ID, PC1, PC2 coordinates, radius, and texture.

#### `PcaScreeChart.jsx`
- **Purpose**: 8-component Scree bar chart of explained variance.
- **Component Data**:
  - PC1: 44.59% (Cum: 44.59%) [Retained]
  - PC2: 18.55% (Cum: 63.14%) [Retained]
  - PC3: 9.58% (Cum: 72.72%) [Retained]
  - PC4: 6.59% (Cum: 79.32%) [Retained]
  - PC5-PC8: 4.82%, 3.86%, 2.25%, 1.58% [Unretained, gray]
- **Summary**: Total 79.32% cumulative variance retained mapped into 4 qubits $\theta \in [-\pi, +\pi]^4$.

#### `RocCurveChart.jsx`
- **Purpose**: SVG ROC Curves comparing discriminative power.
- **Model Paths & AUCs**:
  - **Hybrid**: AUC `0.9983` (Thick Teal line `#0F766E`, width `2.5`)
  - **XGBoost**: AUC `0.9970` (Dark ink line `#14211F`, width `1.8`)
  - **VQC**: AUC `0.9960` (Dashed Slate line `#5B6664`, width `1.8`)
  - **Chance Line**: 45-degree diagonal dashed line `#D1CFCA`.

---

### 7.3 Workspace Views & Data Ingestion

#### `UploadZone.jsx`
- **Modes**:
  1. `Single CSV`: Drag-and-drop combined features + target column.
  2. `Dual CSV`: Two independent drop targets:
     - Features File (X)
     - Target / Labels File (y)
- **Features**: Drag-over styling, file size calculation, remove/change file buttons, automatic parsing of `.csv` extensions, max 25MB check.

#### `DatasetSummaryCard.jsx`
- Displays 4 metric pillars in a clean grid:
  1. **Samples**: e.g., `569` (biopsy instances)
  2. **Features**: e.g., `30` (continuous inputs)
  3. **Target**: e.g., `Diagnosis` (Binary B / M)
  4. **Missing**: e.g., `0` (0 null entries)
- Action buttons: "Change File" (`ghost`) and "Continue to Pipeline" (`primary` with `ArrowRight`).

#### `ResearchPipelineView.jsx`
- **Route**: `/pipeline/:id`.
- **4 Real-Time Phases**:
  - **Phase 01: Preprocessing & Quantum Angle Mapping**: 7-step reasoning list:
    1. Ingesting Tabular Data (`Search` icon)
    2. Validating Schema & Invariants (`ShieldCheck` icon)
    3. Statistical Profiling (`BarChart3` icon)
    4. Variance & Z-Score Normalization (`Filter` icon)
    5. PCA Subspace Dimensionality Reduction (`Sliders` icon)
    6. Quantum Angle Encoding (`Binary` icon)
    7. Quantum State Preparation (`Orbit` icon)
    - Expandable step accordions displaying raw mathematical matrices and logs.
  - **Phase 02: Empirical Model Training (5-Fold Stratified Cross-Validation)**:
    - XGBoost (Classical Decision Trees)
    - Variational Quantum Classifier (PennyLane 4-Qubit RY Ansatz)
    - Hybrid Quantum-Classical Combiner (Soft-Voting Fusion)
    - Live timer during execution, real-time accuracy and runtime metrics upon completion.
  - **Phase 03: Benchmark Comparison Table**:
    - Columns: Model, Type, Accuracy, F1 Score, Sensitivity, Specificity, ROC-AUC, Runtime.
    - CTA Button: "View Benchmark & Graphs" navigating to `/results/:id`.
  - **Phase 04: Deterministic Pipeline Execution Stream**:
    - Terminal-style scrollable live log feed with timestamped output messages.

#### `ResearchHistorySection.jsx`
- **ID**: `#history`.
- **Features**:
  - Filter pills: `All runs`, `XGBoost`, `VQC`, `Hybrid`.
  - Search input: Live filtering by experiment ID, dataset filename, or model type.
  - History cards displaying experiment number, model icon, sample count, accuracy, F1, training latency, and an "Inspect" CTA button loading the run into the results workspace.
  - "View All Historical Records" / "Show Fewer" toggle.

---

### 7.4 Landing & Informational Views

#### `HomePage.jsx`
- **Hero Section**:
  - Headline: `Hybrid Quantum-Classical Model for Early Disease Detection` (Instrument Serif, max 65ch).
  - Subhead: `Empirically evaluated architecture combining clinical biomarker encoding with 4-qubit quantum statevector classification.`
  - CTA: "Try the demo" button jumping to `/dashboard#upload`.
- **"How it works" 3-Step Section**:
  - `01`: Input clinical data (30 biopsy measurements).
  - `02`: Hybrid quantum analysis (Classical model + quantum circuit).
  - `03`: Early risk result (Calibrated combined risk score).

#### `DashboardPage.jsx`
- Structured as a continuous, unified single-page layout:
  1. `<DashboardOverview />` (`#overview`)
  2. `<DemoSection />` (`#upload`)
  3. `<ResearchHistorySection />` (`#history`)
  4. `<ModelsSection />` (`#models`)
  5. `<AboutSection />` (`#about`)

#### `DemoSection.jsx`
- **Two Interactive Modes**:
  1. `Upload dataset`: Integrates `<UploadZone />` with instant "Load Wisconsin Biopsy baseline (569 samples × 30 features)" fallback button.
  2. `Patient case inference`: Interactive clinical form:
     - Presets: `Patient Case A (Benign)` and `Patient Case B (Malignant)`.
     - 6 editable continuous inputs: `radius_mean`, `texture_mean`, `perimeter_mean`, `area_mean`, `smoothness_mean`, `compactness_mean`.
     - "Evaluate Risk" button calling `POST /api/predict`.
     - Dynamic Diagnosis Card: Visual badge (Green Low Risk / Amber Elevated Risk), confidence %, model probability breakdown (XGBoost %, VQC %, Hybrid %), and top risk driver bars.

#### `ModelsSection.jsx`
- 3 standardized cards summarizing evaluated architectures:
  1. **XGBoost Baseline (Classical)**: Accuracy 97.37%, Sensitivity 92.86%, Specificity 100.0%, Latency 45ms.
  2. **Variational Quantum Classifier (Quantum)**: Accuracy 92.98%, Sensitivity 80.95%, Specificity 100.0%, Latency 180s.
  3. **Hybrid Quantum-Classical Combiner (Ensemble)**: Highlighted with `#0F766E` border. Accuracy 96.49%, Sensitivity 90.48%, Specificity 100.0%, ROC-AUC 99.80%.

#### `TechnologyPage.jsx`
- **Route**: `/technology`.
- Comprehensive technical documentation:
  1. Detailed model cards with architectural descriptions and hyperparameter specs.
  2. **4-Qubit Variational Ansatz**: Schematic ASCII circuit diagram showing $|0\rangle \rightarrow RY(\theta_i) \rightarrow \text{CNOT ring} \rightarrow RY(w_i) \rightarrow \langle Z \rangle$ measurement.
  3. **Mathematical Preprocessing Protocol**: Formal definitions of Z-score normalization, PCA subspace projection, and affine quantum angle mapping.
  4. Embedded interactive `<ModelComparisonCard />`.

---

### 7.5 Results Workspace

#### `ResultsWorkspaceView.jsx`
- **Route**: `/results/:id`.
- **Top Bar**: Breadcrumbs (`Back to dashboard / View pipeline / Results Workspace (Case #...)`) and "New Experiment" action.
- **Empirical Finding Banner**:
  - Scholarly summary: *"Comparable Performance • No Quantum Advantage Observed"*.
  - Key stats: Accuracy Delta `-0.35 pp`, Classical Speedup `~74,000×`.
- **Tab Navigation**:
  - `All Results`
  - `01 Benchmark & Graphs`
  - `02 Quantum Circuit`
  - `03 Explainability (XAI)`
- **Child Components**:
  - `<ModelComparisonCard />`: Dynamic view switcher between **Metrics Grid**, **Confusion Matrix**, **ROC Curves**, and **PCA Subspace**.
  - `<QuantumCircuitCard />`: Interactive 4-qubit Hilbert space register explorer with state formulas ($|\psi_i\rangle = \cos(\theta_i/2)|0\rangle + \sin(\theta_i/2)|1\rangle$).
  - `<ExplainabilityCard />`: Top 10 cell nuclear feature attributions with relative weight bars (Mean Concave Points $+0.261$, Mean Concavity $+0.258$, Worst Concave Points $+0.251$, etc.).

---

## 8. Static Ground Truth Dataset & Verified Benchmarks

When backend data is loading or offline, the frontend relies on verified empirical benchmark constants in `src/data/benchmarkData.js`:

```javascript
export const VERIFIED_DATA = {
  dataset_info: {
    name: 'Breast Cancer Wisconsin (Diagnostic)',
    filename: 'breast_cancer_features.csv',
    samples: 569,
    features: 30,
    classes: ['Benign (B)', 'Malignant (M)'],
    class_counts: { 'Benign (B)': 357, 'Malignant (M)': 212 },
    missing_values: 0,
    target_column: 'diagnosis',
    validation_status: 'Ready',
  },
  preprocessing: {
    stages: [
      { step: '01', name: 'Raw Ingestion', desc: '569 samples × 30 continuous morphological features' },
      { step: '02', name: 'Variance Filtering', desc: 'VarianceThreshold(0.0) retained all 30 features' },
      { step: '03', name: 'Z-Score Scaling', desc: 'StandardScaler normalization (mean=0, std=1) on train only' },
      { step: '04', name: 'PCA Subspace', desc: '4 Orthogonal components (79.32% cumulative variance)' },
      { step: '05', name: 'Angle Scaling', desc: 'Linear scaling into valid qubit angles θ ∈ [-π, +π]⁴' },
      { step: '06', name: 'Quantum State', desc: '4-Qubit state |ψ(θ)⟩ prepared for RY state preparation' },
    ],
    pca: {
      total_variance_explained: 79.32,
      components: [
        { name: 'PC1', variance: 44.59, cumulative: 44.59 },
        { name: 'PC2', variance: 18.55, cumulative: 63.14 },
        { name: 'PC3', variance: 9.58, cumulative: 72.72 },
        { name: 'PC4', variance: 6.59, cumulative: 79.32 },
      ],
    },
  },
  benchmark: {
    dataset_id: '40f003e3-848d-4b85-92e3-35897dfbc526',
    evaluation_type: 'Stratified Train-Test Split (80/20)',
    random_seed: 42,
    models: [
      {
        model_type: 'XGBoost',
        category: 'Classical',
        accuracy: 97.37,
        f1: 96.30,
        sensitivity: 92.86,
        specificity: 100.0,
        roc_auc: 99.70,
        training_time: 0.045,
        inference_time: 0.0005,
        qubits: 0,
      },
      {
        model_type: 'Variational Quantum Classifier (VQC)',
        category: 'Quantum',
        accuracy: 92.98,
        f1: 89.47,
        sensitivity: 80.95,
        specificity: 100.0,
        roc_auc: 99.60,
        training_time: 180.0,
        inference_time: 0.38,
        qubits: 4,
      },
      {
        model_type: 'Hybrid (XGBoost + VQC)',
        category: 'Hybrid',
        accuracy: 96.49,
        f1: 95.00,
        sensitivity: 90.48,
        specificity: 100.0,
        roc_auc: 99.83,
        training_time: 180.05,
        inference_time: 0.38,
        qubits: 4,
      },
    ],
    finding: 'Under the tested configuration, the Quantum-Classical Hybrid model achieved an empirical ROC-AUC of 99.83%, improving global ranking discrimination over both standalone XGBoost (99.70%) and VQC (99.60%). Both XGBoost and Hybrid maintained 100% test specificity (zero false positives).',
  },
};
```

---

## 9. Error Handling, Edge Cases & Guard Rails

1. **Request Guard for Training**: Concurrent execution of model training is strictly locked via `isTrainingInProgress` ref and state to prevent race conditions.
2. **Fallback Dataset ID**: Any missing or corrupted ID automatically falls back to baseline `40f003e3-848d-4b85-92e3-35897dfbc526`.
3. **Invalid Case ID Screen**: If an invalid or unrecorded numerical ID is requested on `/results/:id` or `/pipeline/:id`, render the clear "Case not found" fallback card with a direct button back to `/dashboard`.
4. **Backend Liveness Detection**: If the FastAPI backend is offline (`checkHealth().online === false`), display a warning banner while gracefully falling back to verified empirical benchmark data.
5. **Reduced Motion**: All scroll animations and Framer Motion transitions check `window.matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 10. Verification & Quality Checklist for the AI Replicator

When this frontend is built by another AI, it must satisfy every one of the following criteria:

- [ ] **Exact Colors**: `#FAFAF7` background, `#FFFFFF` cards, `#E7E5E0` borders, `#14211F` primary ink text, `#5B6664` secondary slate text, `#0F766E` deep teal accent, `#B45309` amber alert.
- [ ] **Exact Fonts**: `Instrument Serif` for all serif titles/headings and `Inter` for body/UI.
- [ ] **Tabular Numbers**: Applied to all metric values, benchmark percentages, and runtime latencies.
- [ ] **Continuous Page Flow**: `/dashboard` scrolls smoothly between `#overview`, `#upload`, `#history`, `#models`, and `#about`.
- [ ] **Navbar Functionality**: Active link animated pill indicator, active case pill, "New analysis" trigger, mobile responsive drawer.
- [ ] **Dual CSV Support**: File upload zone accepts single CSVs or separate features & target CSV files.
- [ ] **Deterministic Pipeline View**: Real-time 7-step data trace and live training model state updates with terminal logs.
- [ ] **Interactive Visualizations**: Working SVG Confusion Matrix tabs, 2D PCA Scatter plot with tooltips, Scree variance chart, and multi-model ROC discrimination curves.
- [ ] **Zero Glowing Artifacts**: The UI strictly adheres to a clean, crisp, editorial medical journal aesthetic.
