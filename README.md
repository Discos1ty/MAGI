# MAGI

# MAGI: Hybrid Quantum Machine Learning Platform for Early Disease Detection

**Team Name:** Team N3RV 
**Problem Statement ID:** 26139  
**Domain:** MedTech / Quantum Computing / Healthcare AI  

---

## 📌 Executive Summary

Early clinical diagnosis is often hampered by high-dimensional, noisy biomedical data where complex, non-linear feature interactions evade classical detection methods. **Project MAGI** is a clinical-grade **Hybrid Quantum Machine Learning (HQML)** diagnostic platform designed to detect life-threatening pathologies at their earliest onset.

MAGI does not aim to discard classical machine learning; instead, it establishes an end-to-end framework where classical preprocessing and ensemble baselines converge with **Variational Quantum Circuits (VQCs)**. By encoding high-dimensional biomedical features into quantum Hilbert spaces via entanglement and parameterized rotation gates, MAGI targets non-linear correlations that are computationally intractable for classical architectures alone—benchmarking every quantum prediction against industry-standard classical models while maintaining total diagnostic interpretability via Explainable AI (XAI).

---

## 🔬 Core System Architecture & Pipeline

flowchart TD
    A[Patient Data <br/><i>CSV / Tabular</i>] --> B[Classical Preprocessing <br/><i>Imputation, Scaling, PCA</i>]
    
    B --> C[Classical Benchmark <br/><i>XGBoost & Random Forest</i>]
    B --> D[Quantum Pipeline <br/><i>Angle Encoding & CNOT Ansatz</i>]
    
    D --> D1[VQC via PennyLane <br/><i>Classical Optimization Loop</i>]
    
    C --> E[Explainability & XAI <br/><i>SHAP & Discrepancy Analysis</i>]
    D1 --> E
    
    E --> F[Clinical Dashboard UI <br/><i>Benchmarking & Risk Stratification</i>]

    style A fill:#f9f9f9,stroke:#333,stroke-width:1px
    style B fill:#e1f5fe,stroke:#0288d1,stroke-width:1px
    style C fill:#e8f5e9,stroke:#388e3c,stroke-width:1px
    style D fill:#ede7f6,stroke:#512da8,stroke-width:1px
    style D1 fill:#ede7f6,stroke:#512da8,stroke-width:1px
    style E fill:#fffde7,stroke:#fbc02d,stroke-width:1px
    style F fill:#fce4ec,stroke:#c2185b,stroke-width:1px


### 1. Data Ingestion & Classical Preprocessing
* Input features undergo automated normalization and variance thresholding.
* Dimensionality reduction compresses complex patient metrics into optimal feature vectors suited for near-term Noisy Intermediate-Scale Quantum (NISQ) devices.

### 2. Quantum Encoding & Variational Quantum Circuit (VQC)
* **Angle Encoding:** Classical feature vectors are mapped into rotation angles ($\theta$) across multi-qubit registers using single-qubit rotation gates ($R_x$, $R_y$, or $R_z$).
* **Entangling Ansatz:** Controlled-NOT (CNOT) gates introduce quantum entanglement, allowing the circuit to construct cross-feature correlations across an exponentially large Hilbert space.
* **Hybrid Optimization:** Measurement expectation values (Pauli-Z observables) are passed back to a classical gradient descent optimizer (e.g., Adam / COBYLA) via parameter-shift rules to iteratively update circuit gate parameters.

### 3. Classical Benchmarking & Explainable AI (XAI)
* **Baseline Engine:** Integrated with an optimized **XGBoost** and ensemble model to provide real-time side-by-side performance comparisons.
* **Explainability Layer:** Features built-in **SHAP (SHapley Additive exPlanations)** to break the "black-box" dilemma in medical AI, giving clinicians exact attribution scores and transparent reasoning behind each risk score.

---

## 📊 Current Milestone: Breast Cancer Detection

MAGI currently validates its hybrid pipeline against the **UCI Wisconsin Breast Cancer Database**:
* **Dataset Characteristics:** 30 continuous real-world pathological features derived from digitized Fine Needle Aspirate (FNA) images of breast masses.
* **Clinical Task:** Binary classification (Malignant vs. Benign).
* **Comparative Outcome:** MAGI benchmarks the VQC's convergence behavior, precision-recall curve, and false-negative minimization directly against XGBoost, analyzing where quantum entanglement uncovers latent risk patterns missed by classical decision trees.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Quantum Computing** | PennyLane, Qiskit Runtime |
| **Classical ML & Deep Learning** | PyTorch, XGBoost, Scikit-Learn |
| **Interpretability / XAI** | SHAP, Matplotlib, Seaborn |
| **Backend & Pipeline** | Python 3.10+, FastAPI / Flask, NumPy, Pandas |
| **Frontend / Researcher UI** | Interactive Web Dashboard, React, Tailwind CSS |

---

## 🚀 Future Roadmap & Expansion

Phase 1 (Current)       Phase 2                         Phase 3
[Breast Cancer HQML] ──► [Multi-Disease Expansion] ──► [National Infrastructure]
• Wisconsin Benchmark    • Alzheimer's (fMRI/Tabular) • ABDM / ABHA Integration
• XGBoost vs VQC         • Parkinson's (Vocal/Motor)  • NQM Quantum Hub Deployment
• SHAP Integration       • Lung Cancer & CVD          • FHIR Compliance

### 1. Multi-Disease Diagnostic Expansion
Expanding MAGI's hybrid framework from oncological biopsy metrics to multi-modal chronic diseases:
* **Neurological Disorders (Alzheimer's & Parkinson's):** Processing multi-modal biomarker datasets, gait telemetry, and acoustic speech biomarkers using Quantum Kernel Estimation and Hybrid Quantum Neural Networks (QNNs).
* **Cardiovascular Diseases (CVD):** Real-time arrhythmia and heart failure risk prediction using continuous vitals and ECG vector signals.
* **Pulmonary & Lung Oncology:** Integrating low-dose CT numerical metrics and genomic expression markers.

### 2. Integration with Indian National Initiatives

* **Ayushman Bharat Digital Mission (ABDM) Compliance:**
  * **ABHA (Ayushman Bharat Health Account) Linking:** Integration with ABDM M1, M2, and M3 milestones, allowing clinicians to fetch anonymized patient electronic health records (EHR) via consent-based workflows.
  * **Interoperable Diagnostic Data:** Standardizing input and diagnostic outputs to comply with **FHIR (Fast Healthcare Interoperability Resources)** protocols for seamless clinical exchange across Indian hospital networks.

* **National Quantum Mission (NQM) Alignment:**
  * **Transition from Simulators to Hardware:** Moving execution from PennyLane quantum simulators to indigenous quantum processing units (QPUs) deployed under NQM Thematic Hubs (T-Hubs).
  * **Algorithmic NISQ Scalability:** Implementing error mitigation techniques (Zero-Noise Extrapolation, Readout Error Mitigation) tailored for 50–100 physical qubit systems supported under the NQM roadmap.



