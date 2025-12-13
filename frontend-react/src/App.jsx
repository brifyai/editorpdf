import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { StatisticsProvider } from './contexts/StatisticsContext';

// Layout Components (cargar inmediatamente)
import Sidebar from './components/layout/Sidebar';
import Main from './components/layout/Main';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Auth Components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

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
const PowerPointToPDF = React.lazy(() => import('./components/features/pdf/PowerPointToPDF'));
const ExcelToPDF = React.lazy(() => import('./components/features/pdf/ExcelToPDF'));
const WebToPDF = React.lazy(() => import('./components/features/pdf/WebToPDF'));
const ImagesToPDF = React.lazy(() => import('./components/features/pdf/ImagesToPDF'));
const PDFToWord = React.lazy(() => import('./components/features/pdf/PDFToWord'));
const PDFToPowerPoint = React.lazy(() => import('./components/features/pdf/PDFToPowerPoint'));
const PDFToExcel = React.lazy(() => import('./components/features/pdf/PDFToExcel'));
const PDFToImages = React.lazy(() => import('./components/features/pdf/PDFToImages'));
const AdvancedEditor = React.lazy(() => import('./components/features/pdf/AdvancedEditor'));
const SignDocument = React.lazy(() => import('./components/features/pdf/SignDocument'));
const Watermark = React.lazy(() => import('./components/features/pdf/Watermark'));
const RotatePages = React.lazy(() => import('./components/features/pdf/RotatePages'));
const ProtectPassword = React.lazy(() => import('./components/features/pdf/ProtectPassword'));
const UnlockPDF = React.lazy(() => import('./components/features/pdf/UnlockPDF'));
const PageNumbers = React.lazy(() => import('./components/features/pdf/PageNumbers'));
const CropPDF = React.lazy(() => import('./components/features/pdf/CropPDF'));
const OCRRecognition = React.lazy(() => import('./components/features/pdf/OCRRecognition'));
const MobileScanner = React.lazy(() => import('./components/features/pdf/MobileScanner'));
const CompareDocuments = React.lazy(() => import('./components/features/pdf/CompareDocuments'));
const CensurarInformacion = React.lazy(() => import('./components/features/pdf/CensurarInformacion'));
const AnalisisInteligente = React.lazy(() => import('./components/features/pdf/AnalisisInteligente'));
const OCRInteligente = React.lazy(() => import('./components/features/pdf/OCRInteligente'));
const ExtraccionInteligente = React.lazy(() => import('./components/features/pdf/ExtraccionInteligente'));
const PDFToolGenerator = React.lazy(() => import('./components/features/pdf/PDFToolsGenerator'));

// Styles - IMPORT ORDER IS CRITICAL!
// Import premium.css LAST to ensure it overrides all other styles
import './styles/App.css';
import './styles/Main.css';
import './styles/Header.css';
import './styles/animations.css';
import './styles/auth.css';
import './styles/styles.css';
import './styles/ui-improvements.css';
import './styles/premium.css'; // PREMIUM CSS MUST BE LAST TO OVERRIDE EVERYTHING

// Scripts - TEMPORALMENTE DESACTIVADO PARA DEBUGGING
// import './scripts/interactions.js';

// Public Route Component (sin autenticación)
const PublicRoute = ({ children }) => {
  return children;
};

// App Layout Component
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 769);
  const isMobile = window.innerWidth < 769;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <div className="app-main">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <Main sidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar}>
          {children}
        </Main>
      </div>
      {/* Mostrar bottom navigation solo en móvil */}
      {isMobile && <MobileBottomNav />}
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

// Main App Routes Component optimizado - SIN AUTENTICACIÓN
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación - SIN layout */}
      <Route path="/acceso" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      
      {/* Ruta principal - Dashboard público */}
      <Route path="/" element={
        <AppLayout>
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/analisis-documentos" element={
        <AppLayout>
          <LazyWrapper>
            <DocumentAnalysis />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/analisis-imagenes" element={
        <AppLayout>
          <LazyWrapper>
            <ImageAnalysis />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/historial-analisis" element={
        <AppLayout>
          <LazyWrapper>
            <AnalysisHistory />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/ocr-conversion" element={
        <AppLayout>
          <LazyWrapper>
            <OCRProcessing />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/conversion-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <ImageConversion />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/conversion-word" element={
        <AppLayout>
          <LazyWrapper>
            <WordConversion />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/procesamiento-batch" element={
        <AppLayout>
          <LazyWrapper>
            <BatchAnalysis />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas-batch" element={
        <AppLayout>
          <LazyWrapper>
            <BatchTools />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/inteligencia-artificial" element={
        <AppLayout>
          <LazyWrapper>
            <AIConfiguration />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/metricas-ia" element={
        <AppLayout>
          <LazyWrapper>
            <AIMetrics />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/comparacion-modelos" element={
        <AppLayout>
          <LazyWrapper>
            <ModelComparison />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/exportacion-avanzada" element={
        <AppLayout>
          <LazyWrapper>
            <ExportTools />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/configuracion" element={
        <AppLayout>
          <LazyWrapper>
            <Settings />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/estadisticas" element={
        <AppLayout>
          <LazyWrapper>
            <Statistics />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/ayuda-soporte" element={
        <AppLayout>
          <LazyWrapper>
            <Help />
          </LazyWrapper>
        </AppLayout>
      } />
      
      {/* Rutas para herramientas específicas PDF */}
      <Route path="/herramientas/unir-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <MergePDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/separar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <SplitPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/organizar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <OrganizePages />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/optimizar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <CompressPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/restaurar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <RepairPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/word-a-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <WordToPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/powerpoint-a-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <PowerPointToPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/excel-a-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <ExcelToPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/web-a-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <WebToPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/imagenes-a-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <ImagesToPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/pdf-a-word" element={
        <AppLayout>
          <LazyWrapper>
            <PDFToWord />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/pdf-a-powerpoint" element={
        <AppLayout>
          <LazyWrapper>
            <PDFToPowerPoint />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/pdf-a-excel" element={
        <AppLayout>
          <LazyWrapper>
            <PDFToExcel />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/pdf-a-imagenes" element={
        <AppLayout>
          <LazyWrapper>
            <PDFToImages />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/editor-avanzado" element={
        <AppLayout>
          <LazyWrapper>
            <AdvancedEditor />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/firmar-documento" element={
        <AppLayout>
          <LazyWrapper>
            <SignDocument />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/marca-de-agua" element={
        <AppLayout>
          <LazyWrapper>
            <Watermark />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/rotar-paginas" element={
        <AppLayout>
          <LazyWrapper>
            <RotatePages />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/proteger-contrasena" element={
        <AppLayout>
          <LazyWrapper>
            <ProtectPassword />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/desbloquear-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <UnlockPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/numeracion-paginas" element={
        <AppLayout>
          <LazyWrapper>
            <PageNumbers />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/recortar-documento" element={
        <AppLayout>
          <LazyWrapper>
            <CropPDF />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/reconocimiento-texto" element={
        <AppLayout>
          <LazyWrapper>
            <OCRRecognition />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/escaner-movil" element={
        <AppLayout>
          <LazyWrapper>
            <MobileScanner />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/comparar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <CompareDocuments />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/censurar-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <CensurarInformacion />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/analisis-pdf" element={
        <AppLayout>
          <LazyWrapper>
            <AnalisisInteligente />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/ocr-inteligente" element={
        <AppLayout>
          <LazyWrapper>
            <OCRInteligente />
          </LazyWrapper>
        </AppLayout>
      } />
      
      <Route path="/herramientas/extraccion-inteligente" element={
        <AppLayout>
          <LazyWrapper>
            <ExtraccionInteligente />
          </LazyWrapper>
        </AppLayout>
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
        <AppProvider>
          <StatisticsProvider>
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
          </StatisticsProvider>
        </AppProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
