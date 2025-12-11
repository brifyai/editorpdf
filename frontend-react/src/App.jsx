import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Main from './components/layout/Main';

// Auth Components
import AuthPage from './components/auth/AuthPage';

// Feature Components
import DocumentAnalysis from './components/features/documents/DocumentAnalysis';
import ImageAnalysis from './components/features/documents/ImageAnalysis';
import AnalysisHistory from './components/features/documents/AnalysisHistory';
import OCRProcessing from './components/features/ocr/OCRProcessing';
import ImageConversion from './components/features/ocr/ImageConversion';
import WordConversion from './components/features/ocr/WordConversion';
import OCRSettings from './components/features/ocr/OCRSettings';
import BatchAnalysis from './components/features/batch/BatchAnalysis';
import BatchTools from './components/features/batch/BatchTools';
import AIConfiguration from './components/features/ai/AIConfiguration';
import ModelSelection from './components/features/ai/ModelSelection';
import ModelComparison from './components/features/ai/ModelComparison';
import AIMetrics from './components/features/ai/AIMetrics';
import ExportTools from './components/features/export/ExportTools';
import Settings from './components/features/settings/Settings';
import Statistics from './components/features/statistics/Statistics';
import Help from './components/features/help/Help';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Styles
import './styles/App.css';
import './styles/premium.css';
import './styles/Sidebar.css';
import './styles/Main.css';
import './styles/animations.css';
import './styles/auth.css';
import './styles/sidebar-material.css';
import './styles/styles.css';
import './styles/ui-improvements.css';

// Scripts
import './scripts/interactions.js';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

// App Layout Component
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 769);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <div className="app-main">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <Main sidebarOpen={isSidebarOpen}>{children}</Main>
      </div>
    </div>
  );
};

// Main App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <DocumentAnalysis />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <AppLayout>
            <DocumentAnalysis />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <AppLayout>
            <AnalysisHistory />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr" element={
        <ProtectedRoute>
          <AppLayout>
            <OCRProcessing />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr/convert" element={
        <ProtectedRoute>
          <AppLayout>
            <ImageConversion />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <OCRSettings />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/batch" element={
        <ProtectedRoute>
          <AppLayout>
            <BatchAnalysis />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/batch/tools" element={
        <ProtectedRoute>
          <AppLayout>
            <BatchTools />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai" element={
        <ProtectedRoute>
          <AppLayout>
            <AIConfiguration />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/models" element={
        <ProtectedRoute>
          <AppLayout>
            <ModelSelection />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/comparison" element={
        <ProtectedRoute>
          <AppLayout>
            <ModelComparison />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/metrics" element={
        <ProtectedRoute>
          <AppLayout>
            <AIMetrics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/export" element={
        <ProtectedRoute>
          <AppLayout>
            <ExportTools />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/statistics" element={
        <ProtectedRoute>
          <AppLayout>
            <Statistics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/help" element={
        <ProtectedRoute>
          <AppLayout>
            <Help />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas adicionales para el Sidebar */}
      <Route path="/images" element={
        <ProtectedRoute>
          <AppLayout>
            <ImageAnalysis />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/pdf-convert" element={
        <ProtectedRoute>
          <AppLayout>
            <ImageConversion />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/word-convert" element={
        <ProtectedRoute>
          <AppLayout>
            <WordConversion />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-config" element={
        <ProtectedRoute>
          <AppLayout>
            <AIConfiguration />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-metrics" element={
        <ProtectedRoute>
          <AppLayout>
            <AIMetrics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/models" element={
        <ProtectedRoute>
          <AppLayout>
            <ModelSelection />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/stats" element={
        <ProtectedRoute>
          <AppLayout>
            <Statistics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppProvider>
            <div className="app">
              {/* Premium Background Effects */}
              <div className="premium-background"></div>
              <div className="particles-container">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
              
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(20, 20, 30, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#00ff88',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ff006e',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AppProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
