import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // Dataset for the Benchmarks page: the upload when continuing from Upload, otherwise null so
  // the page benchmarks scikit-learn's built-in Wisconsin (WDBC) dataset
  const [benchmarkDataset, setBenchmarkDataset] = useState(null);
  // SHAP explanations for uploaded patients, plus which patient to show first
  const [patientTest, setPatientTest] = useState(null);

  const navigateTo = (page) => {
    if (page === 'pipeline') setBenchmarkDataset(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToPreprocessing = (dataset, target) => {
    setBenchmarkDataset({ ...dataset, targetColumn: target });
    setCurrentPage('pipeline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPatientShap = (explanation, patient) => {
    setPatientTest({ ...explanation, selectedPatient: patient });
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#14211F]">
      {/* Ambient green aurora behind the page content */}
      <div className="ambient-background" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Left Sidebar Navigation — Home, Upload Patient Data, Benchmarks, Analytics, Results */}
      <Navbar 
        activePage={currentPage} 
        onNavigate={navigateTo}
        hasResults={Boolean(patientTest)}
      />

      {/* Content column, offset by the sidebar width on desktop */}
      <div className="flex-1 flex flex-col md:pl-60">
        {/* Main Content Area */}
        <main className="relative z-10 flex-1">
          {currentPage === 'home' && (
            <HomePage 
              onTryDemo={() => navigateTo('upload')} 
            />
          )}

          {currentPage === 'upload' && (
            <UploadPage 
              onContinueToPreprocessing={handleContinueToPreprocessing} 
              onViewPatientShap={handleViewPatientShap}
            />
          )}

          {currentPage === 'pipeline' && (
            <PipelinePage 
              key={benchmarkDataset?.id || 'sklearn-wdbc'}
              dataset={benchmarkDataset}
              onNavigateToUpload={() => navigateTo('upload')}
            />
          )}

          {currentPage === 'results' && (
            <ResultsPage
              patientTest={patientTest}
              onNavigateToUpload={() => navigateTo('upload')}
              onNavigateToPipeline={() => navigateTo('pipeline')}
            />
          )}
        </main>

        {/* Scholarly Footer */}
        <Footer />
      </div>
    </div>
  );
}