import React from 'react';
import { LayoutDashboard, Users, Package, FileText, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();

  const isAllowed = (allowedRoles: string[]) => {
    return user && allowedRoles.includes(user.role);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'customers', label: 'Customers', icon: Users, show: isAllowed(['ADMIN', 'SALES', 'ACCOUNTS']) },
    { id: 'products', label: 'Products', icon: Package, show: true },
    { id: 'challans', label: 'Challans', icon: FileText, show: true },
    { id: 'stock-logs', label: 'Audit Logs', icon: History, show: isAllowed(['ADMIN', 'WAREHOUSE']) },
  ].filter((item) => item.show);

  return (
    <nav className="mobile-bottom-dock">
      <div className="dock-container">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'customers' && currentTab === 'customer-detail') ||
            (item.id === 'challans' && (currentTab === 'create-challan' || currentTab === 'challan-detail'));

          return (
            <button
              key={item.id}
              className={`dock-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <div className="dock-icon-wrap">
                <IconComp size={20} />
              </div>
              <span className="dock-label">{item.label}</span>
              {isActive && <div className="dock-active-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
