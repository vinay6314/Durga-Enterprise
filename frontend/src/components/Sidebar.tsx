import React from 'react';
import { LayoutDashboard, Users, Package, FileText, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DurgaLogo } from './DurgaLogo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const isAllowed = (allowedRoles: string[]) => {
    return user && allowedRoles.includes(user.role);
  };

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`mobile-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <DurgaLogo size={34} />
          <div>
            <div className="brand-name">Durga Enterprise</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {isAllowed(['ADMIN', 'SALES', 'ACCOUNTS']) && (
            <button
              className={`nav-item ${currentTab === 'customers' ? 'active' : ''}`}
              onClick={() => handleNavClick('customers')}
            >
              <Users size={18} />
              <span>Customers (CRM)</span>
            </button>
          )}

          <button
            className={`nav-item ${currentTab === 'products' ? 'active' : ''}`}
            onClick={() => handleNavClick('products')}
          >
            <Package size={18} />
            <span>Products & Stock</span>
          </button>

          {isAllowed(['ADMIN', 'WAREHOUSE']) && (
            <button
              className={`nav-item ${currentTab === 'stock-logs' ? 'active' : ''}`}
              onClick={() => handleNavClick('stock-logs')}
            >
              <History size={18} />
              <span>Stock Audit Logs</span>
            </button>
          )}

          <button
            className={`nav-item ${currentTab === 'challans' ? 'active' : ''}`}
            onClick={() => handleNavClick('challans')}
          >
            <FileText size={18} />
            <span>Sales Challans</span>
          </button>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
