import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Navbar } from './components/layout';
import { TradingTerminal } from './components/trading';
import { Dashboard, Markets, Portfolio, Orders, Alerts, Login, News, CompanyDetails, ETFs, Funds, Trades, Strategies, Reports } from './pages';

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/markets"
          element={
            <ProtectedRoute>
              <Layout>
                <Markets />
              </Layout>
            </ProtectedRoute>
          }
        />
        
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
          path="/news"
          element={
            <ProtectedRoute>
              <Layout>
                <News />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/company/:symbol"
          element={
            <ProtectedRoute>
              <Layout>
                <CompanyDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/etf"
          element={
            <ProtectedRoute>
              <Layout>
                <ETFs />
              </Layout>
            </ProtectedRoute>
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
