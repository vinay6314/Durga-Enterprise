import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DurgaLogo } from '../components/DurgaLogo';
import api from '../services/api';
import { LogIn, UserPlus, ShieldCheck, UserCheck, KeyRound, FileSpreadsheet, CheckCircle2, User, Mail, Lock } from 'lucide-react';

interface RoleOption {
  id: string;
  name: string;
  email: string;
  pass: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const rolesList: RoleOption[] = [
  {
    id: 'ADMIN',
    name: 'Admin',
    email: 'vinaychoudary63@gmail.com',
    pass: 'Admin@123',
    description: 'Full access to CRM, Inventory, Sales & Audit Logs',
    icon: ShieldCheck,
    color: '#c084fc',
  },
  {
    id: 'SALES',
    name: 'Sales',
    email: 'sales@erp.com',
    pass: 'Sales@123',
    description: 'Manage Customer CRM & Generate Sales Challans',
    icon: UserCheck,
    color: '#60a5fa',
  },
  {
    id: 'WAREHOUSE',
    name: 'Warehouse',
    email: 'warehouse@erp.com',
    pass: 'Warehouse@123',
    description: 'Product catalog, Stock IN/OUT adjustments & Logs',
    icon: KeyRound,
    color: '#fbbf24',
  },
  {
    id: 'ACCOUNTS',
    name: 'Accounts',
    email: 'accounts@erp.com',
    pass: 'Accounts@123',
    description: 'View Sales Challans & Print PDF Invoices',
    icon: FileSpreadsheet,
    color: '#34d399',
  },
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In state
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('Admin@123');

  const selectedRole = rolesList.find((r) => r.email.toLowerCase() === email.toLowerCase().trim()) || null;

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('ADMIN');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectRole = (role: RoleOption) => {
    setEmail(role.email);
    setPassword(role.pass);
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error || '';
      setError(serverError || 'Invalid email or password. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
      });

      if (res.data.success) {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          login(res.data.data.token, res.data.data.user);
        }, 600);
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      if (serverError && serverError.includes('already exists')) {
        setError('An account with this email already exists. Please click the "Sign In" tab above to log in.');
      } else {
        setError(serverError || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2.25rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '16px',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ margin: '0 auto 0.75rem', display: 'inline-block' }}>
            <DurgaLogo size={60} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Durga Enterprise</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Operations & Enterprise Portal
          </p>
        </div>

        {/* Sign In / Sign Up Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#0F172A',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'signin' ? '#E11D48' : 'transparent',
              color: activeTab === 'signin' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'signup' ? '#06B6D4' : 'transparent',
              color: activeTab === 'signup' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ADE80',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* ========================================== */}
        {/* SIGN IN TAB */}
        {/* ========================================== */}
        {activeTab === 'signin' && (
          <>
            {/* Quick Access Role Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.6rem', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                SELECT QUICK ROLE:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {rolesList.map((r) => {
                  const isSelected = selectedRole ? selectedRole.id === r.id : false;
                  const IconComp = r.icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectRole(r)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                        border: isSelected ? `2px solid ${r.color}` : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? `0 0 10px ${r.color}30` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <IconComp size={16} color={r.color} />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? r.color : 'var(--text-primary)' }}>
                          {r.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={15} color={r.color} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vinaychoudary63@gmail.com"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <LogIn size={18} />
                <span>{submitting ? 'Authenticating...' : `Sign In`}</span>
              </button>
            </form>
          </>
        )}

        {/* ========================================== */}
        {/* SIGN UP TAB */}
        {/* ========================================== */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Vinay Choudary"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="vinaychoudary63@gmail.com"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a strong password (min. 4 chars)"
                  minLength={4}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select System Role</label>
              <select
                className="form-input"
                value={signUpRole}
                onChange={(e) => setSignUpRole(e.target.value)}
                style={{ background: '#0F172A', color: '#FFF', padding: '0.75rem 1rem' }}
              >
                <option value="ADMIN">Admin (Full Control)</option>
                <option value="SALES">Sales Representative</option>
                <option value="WAREHOUSE">Warehouse Operator</option>
                <option value="ACCOUNTS">Accounts / Finance Manager</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.8rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <UserPlus size={18} />
              <span>{submitting ? 'Creating Account...' : 'Create Account & Sign In'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
