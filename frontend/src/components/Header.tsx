import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, LogOut, Menu, Sun, Moon, User, Settings } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  pageTitle: string;
  toggleMobileMenu?: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, toggleMobileMenu, addToast }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isDark = theme !== 'light';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'midnight');
  };

  return (
    <>
      <header className="top-navbar">
        <div className="page-title-section">
          {toggleMobileMenu && (
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} title="Toggle Navigation Menu">
              <Menu size={20} />
            </button>
          )}
          <h1 className="page-title">{pageTitle}</h1>
        </div>

        <div className="nav-actions">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.38rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isDark ? (
              <>
                <Sun size={14} color="#f59e0b" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} color="#6366f1" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Workspace Badge */}
          {user && (
            <div
              className="workspace-badge"
              title="All team members share enterprise operations data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(6,182,212,0.25)',
                background: 'rgba(6,182,212,0.1)',
                color: '#06B6D4',
              }}
            >
              <Building2 size={13} />
              <span>Enterprise Workspace</span>
            </div>
          )}

          {/* User Info Badge & Settings */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Edit Name & Password"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="user-email-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name} ✏️
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</span>
                </div>
                <Settings size={14} color="var(--accent-primary)" />
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171',
                  borderRadius: '8px',
                  padding: '0.4rem 0.6rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Account Profile & Password Settings Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          addToast={addToast}
        />
      )}
    </>
  );
};
