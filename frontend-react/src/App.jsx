import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';

// Layout Components (cargar inmediatamente)
import Sidebar from './components/layout/Sidebar';
import Main from './components/layout/Main';

// Auth Components
import AuthPage from './components/auth/AuthPage';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// LAZY LOADING - Cargar componentes solo cuando se necesiten
const DocumentAnalysis = React.lazy(() => import('./components/features/documents/DocumentAnalysis'));
const ImageAnalysis = React.lazy(() => import('./components/features/documents/ImageAnalysis'));
const AnalysisHistory = React.lazy(() => import('./components/features/documents/AnalysisHistory'));
const OCRProcessing = React.lazy(() => import('./components/features/ocr/OCRProcessing'));
const ImageConversion = React.lazy(() => import('./components/features/ocr/ImageConversion'));
const WordConversion = React.lazy(() => import('./components/features/ocr/WordConversion'));
const OCRSettings = React.lazy(() => import('./components/features/ocr/OCRSettings'));
const BatchAnalysis = React.lazy(() => import('./components/features/batch/BatchAnalysis'));
const BatchTools = React.lazy(() => import('./components/features/batch/BatchTools'));
const AIConfiguration = React.lazy(() => import('./components/features/ai/AIConfiguration'));
const ModelSelection = React.lazy(() => import('./components/features/ai/ModelSelection'));
const ModelComparison = React.lazy(() => import('./components/features/ai/ModelComparison'));
const AIMetrics = React.lazy(() => import('./components/features/ai/AIMetrics'));
const ExportTools = React.lazy(() => import('./components/features/export/ExportTools'));
const Settings = React.lazy(() => import('./components/features/settings/Settings'));
const Statistics = React.lazy(() => import('./components/features/statistics/Statistics'));
const Help = React.lazy(() => import('./components/features/help/Help'));

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

// Componente de carga optimizado
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

// Wrapper para componentes lazy con Suspense
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// Main App Routes Component optimizado
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected Routes con Lazy Loading */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <DocumentAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <DocumentAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AnalysisHistory />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <OCRProcessing />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr/convert" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ImageConversion />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <OCRSettings />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/batch" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <BatchAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/batch/tools" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <BatchTools />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIConfiguration />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/models" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ModelSelection />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/comparison" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ModelComparison />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai/metrics" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIMetrics />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/export" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ExportTools />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Settings />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/statistics" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Statistics />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/help" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Help />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas adicionales para el Sidebar */}
      <Route path="/images" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ImageAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/pdf-convert" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ImageConversion />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/word-convert" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <WordConversion />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-config" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIConfiguration />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-metrics" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIMetrics />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/models" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ModelSelection />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/stats" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Statistics />
            </LazyWrapper>
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
