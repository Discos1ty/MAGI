import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeDataset, setActiveDataset] = useState(null);
  const [pipelineResults, setPipelineResults] = useState(null);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToPreprocessing = (dataset, target) => {
    setActiveDataset({ ...dataset, targetColumn: target });
    setCurrentPage('pipeline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewResults = (results) => {
    setPipelineResults(results);
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#14211F]">
      {/* Sticky Top Navigation — Home, Upload Dataset, Pipeline, Results */}
      <Navbar 
        activePage={currentPage} 
        onNavigate={navigateTo}
        hasResults={Boolean(pipelineResults)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage 
            onTryDemo={() => navigateTo('upload')} 
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage 
            onContinueToPreprocessing={handleContinueToPreprocessing} 
          />
        )}

        {currentPage === 'pipeline' && (
          <PipelinePage 
            dataset={activeDataset}
            onNavigateToUpload={() => navigateTo('upload')}
            onViewResults={handleViewResults}
          />
        )}

        {currentPage === 'results' && (
          <ResultsPage
            dataset={activeDataset || pipelineResults?.datasetMeta}
            pipelineData={pipelineResults}
            onNavigateToUpload={() => navigateTo('upload')}
            onNavigateToPipeline={() => navigateTo('pipeline')}
          />
        )}
      </main>

      {/* Scholarly Footer */}
      <Footer />
    </div>
  );
}