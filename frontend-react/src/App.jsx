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
const Dashboard = React.lazy(() => import('./components/Dashboard'));
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

// PDF Tools Components
const MergePDF = React.lazy(() => import('./components/features/pdf/MergePDF'));
const SplitPDF = React.lazy(() => import('./components/features/pdf/SplitPDF'));
const OrganizePages = React.lazy(() => import('./components/features/pdf/OrganizePages'));
const CompressPDF = React.lazy(() => import('./components/features/pdf/CompressPDF'));
const RepairPDF = React.lazy(() => import('./components/features/pdf/RepairPDF'));
const WordToPDF = React.lazy(() => import('./components/features/pdf/WordToPDF'));
const PDFToolGenerator = React.lazy(() => import('./components/features/pdf/PDFToolsGenerator'));

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
              <Dashboard />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analisis-documentos" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <DocumentAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analisis-imagenes" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ImageAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/historial-analisis" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AnalysisHistory />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ocr-conversion" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <OCRProcessing />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/conversion-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ImageConversion />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/conversion-word" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <WordConversion />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/procesamiento-batch" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <BatchAnalysis />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas-batch" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <BatchTools />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inteligencia-artificial" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIConfiguration />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/metricas-ia" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <AIMetrics />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/comparacion-modelos" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ModelComparison />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/exportacion-avanzada" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <ExportTools />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracion" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Settings />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/estadisticas" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Statistics />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ayuda-soporte" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <Help />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas para herramientas específicas PDF */}
      <Route path="/herramientas/unir-documentos" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <MergePDF />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/separar-documentos" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <SplitPDF />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/organizar-paginas" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <OrganizePages />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/optimizar-tamano" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <CompressPDF />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/restaurar-documento" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <RepairPDF />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/word-a-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <WordToPDF />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/powerpoint-a-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="powerpoint-a-pdf" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/excel-a-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="excel-a-pdf" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/web-a-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="web-a-pdf" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/imagenes-a-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="imagenes-a-pdf" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/pdf-a-word" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="pdf-a-word" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/pdf-a-powerpoint" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="pdf-a-powerpoint" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/pdf-a-excel" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="pdf-a-excel" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/pdf-a-imagenes" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="pdf-a-imagenes" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/editor-avanzado" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="editor-avanzado" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/firmar-documento" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="firmar-documento" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/marca-de-agua" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="marca-de-agua" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/rotar-paginas" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="rotar-paginas" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/proteger-contrasena" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="proteger-contrasena" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/desbloquear-pdf" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="desbloquear-pdf" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/numeracion-paginas" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="numeracion-paginas" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/recortar-documento" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="recortar-documento" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/reconocimiento-texto" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="reconocimiento-texto" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/escaner-movil" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="escaner-movil" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/comparar-documentos" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="comparar-documentos" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/censurar-informacion" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="censurar-informacion" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/analisis-inteligente" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="analisis-inteligente" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/ocr-inteligente" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="ocr-inteligente" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/herramientas/extraccion-inteligente" element={
        <ProtectedRoute>
          <AppLayout>
            <LazyWrapper>
              <PDFToolGenerator toolId="extraccion-inteligente" />
            </LazyWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas legacy para compatibilidad */}
      <Route path="/documents" element={<Navigate to="/analisis-documentos" replace />} />
      <Route path="/images" element={<Navigate to="/analisis-imagenes" replace />} />
      <Route path="/history" element={<Navigate to="/historial-analisis" replace />} />
      <Route path="/ocr" element={<Navigate to="/ocr-conversion" replace />} />
      <Route path="/batch" element={<Navigate to="/procesamiento-batch" replace />} />
      <Route path="/ai" element={<Navigate to="/inteligencia-artificial" replace />} />
      <Route path="/export" element={<Navigate to="/exportacion-avanzada" replace />} />
      <Route path="/settings" element={<Navigate to="/configuracion" replace />} />
      <Route path="/statistics" element={<Navigate to="/estadisticas" replace />} />
      <Route path="/help" element={<Navigate to="/ayuda-soporte" replace />} />
      
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
