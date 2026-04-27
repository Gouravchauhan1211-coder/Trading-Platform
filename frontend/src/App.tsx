import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Navbar } from './components/layout';
import { TradingTerminal } from './components/trading';
import { Dashboard, Markets, Portfolio, Orders, Alerts, Login, News, CompanyDetails, ETFs, Funds, Trades, Strategies, Reports } from './pages';
import { wsService } from './services';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-panel-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      wsService.connect();
    } else {
      wsService.disconnect();
    }
    
    return () => {
      wsService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        {/* Publicly Accessible Pages */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        
        <Route
          path="/markets"
          element={
            <Layout>
              <Markets />
            </Layout>
          }
        />

        <Route
          path="/news"
          element={
            <Layout>
              <News />
            </Layout>
          }
        />
        
        <Route
          path="/company/:symbol"
          element={
            <Layout>
              <CompanyDetails />
            </Layout>
          }
        />

        {/* Protected Pages (Login Required) */}
        <Route
          path="/trading"
          element={
            <ProtectedRoute>
              <Layout>
                <TradingTerminal />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Layout>
                <Portfolio />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <Layout>
                <Trades />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/funds"
          element={
            <ProtectedRoute>
              <Layout>
                <Funds />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/strategies"
          element={
            <ProtectedRoute>
              <Layout>
                <Strategies />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/etf"
          element={
            <Layout>
              <ETFs />
            </Layout>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
