import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { StockLogs } from './pages/StockLogs';
import { Challans } from './pages/Challans';
import { CreateChallan } from './pages/CreateChallan';
import { ChallanDetail } from './pages/ChallanDetail';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';

const MainApp: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedChallanId, setSelectedChallanId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
        Loading Durga Enterprise System...
      </div>
    );
  }

  if (!token || !user) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'customers': return 'Customer CRM Database';
      case 'customer-detail': return 'Customer Profile';
      case 'products': return 'Products & Inventory Catalog';
      case 'stock-logs': return 'Stock Audit Log';
      case 'challans': return 'Sales Challans & Invoices';
      case 'create-challan': return 'Create Sales Challan';
      case 'challan-detail': return 'Sales Challan Snapshot';
      default: return 'Durga Enterprise Portal';
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentTab('customer-detail');
  };

  const handleSelectChallan = (id: string) => {
    setSelectedChallanId(id);
    setCurrentTab('challan-detail');
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="main-wrapper">
        <Header
          pageTitle={getPageTitle()}
          toggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          addToast={addToast}
        />

        <main className="content-area page-fade-in" key={currentTab}>
          {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}

          {currentTab === 'customers' && (
            <Customers onSelectCustomer={handleSelectCustomer} addToast={addToast} />
          )}

          {currentTab === 'customer-detail' && selectedCustomerId && (
            <CustomerDetail
              customerId={selectedCustomerId}
              onBack={() => setCurrentTab('customers')}
              addToast={addToast}
            />
          )}

          {currentTab === 'products' && <Products addToast={addToast} />}

          {currentTab === 'stock-logs' && <StockLogs addToast={addToast} />}

          {currentTab === 'challans' && (
            <Challans
              onCreateChallan={() => setCurrentTab('create-challan')}
              onSelectChallan={handleSelectChallan}
              addToast={addToast}
            />
          )}

          {currentTab === 'create-challan' && (
            <CreateChallan
              onBack={() => setCurrentTab('challans')}
              onSuccess={(id) => handleSelectChallan(id)}
              addToast={addToast}
            />
          )}

          {currentTab === 'challan-detail' && selectedChallanId && (
            <ChallanDetail
              challanId={selectedChallanId}
              onBack={() => setCurrentTab('challans')}
              addToast={addToast}
            />
          )}
        </main>

        <Footer />
      </div>

      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2rem',
              background: '#1E293B',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F87171', marginBottom: '0.75rem' }}>
              ⚠️ Application State Notice
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {this.state.error?.message || 'A temporary state error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#E11D48',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Reset App & Clear Cache
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
