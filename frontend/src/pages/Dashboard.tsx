import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardMetrics, SalesChallan } from '../types';
import { KpiCard } from '../components/KpiCard';
import {
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export const Dashboard: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/summary');
        if (res.data.success) {
          setMetrics(res.data.data.metrics);
          setRecentChallans(res.data.data.recentChallans);
        }
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading Dashboard Overview...</div>;
  }

  const totalProducts = metrics?.totalProducts || 0;
  const lowStockCount = metrics?.lowStockProductsCount || 0;
  const healthyStockCount = Math.max(0, totalProducts - lowStockCount);
  const stockHealthPct = totalProducts > 0 ? Math.round((healthyStockCount / totalProducts) * 100) : 100;

  const totalRevenue = metrics?.totalRevenue || 0;
  const totalChallans = metrics?.totalChallans || 0;
  const avgOrderValue = totalChallans > 0 ? Math.round(totalRevenue / totalChallans) : 0;

  return (
    <div>
      {/* KPI Summary Grid */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Customers (CRM)"
          value={metrics?.totalCustomers || 0}
          subtext={`${metrics?.activeCustomers || 0} Active | ${metrics?.leadCustomers || 0} Leads`}
          icon={Users}
          color="#60a5fa"
          bgColor="rgba(96, 165, 250, 0.15)"
        />
        <KpiCard
          title="Total Catalog Products"
          value={metrics?.totalProducts || 0}
          subtext={`Inventory valuation: ₹${(metrics?.totalStockValue || 0).toLocaleString('en-IN')}`}
          icon={Package}
          color="#c084fc"
          bgColor="rgba(192, 132, 252, 0.15)"
        />
        <KpiCard
          title="Low Stock Alerts"
          value={metrics?.lowStockProductsCount || 0}
          subtext="Products below safety stock threshold"
          icon={AlertTriangle}
          color="#f59e0b"
          bgColor="rgba(245, 158, 11, 0.15)"
        />
        <KpiCard
          title="Confirmed Sales Revenue"
          value={`₹${(metrics?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtext={`${metrics?.totalChallans || 0} Total Challans Processed`}
          icon={DollarSign}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.15)"
        />
      </div>

      {/* Middle Operations Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Operations Quick Actions */}
        <div className="card-panel">
          <div className="panel-header">
            <h3 className="panel-title">Operations Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <button
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
              onClick={() => setCurrentTab('create-challan')}
            >
              <PlusCircle size={18} />
              Create Sales Challan
            </button>

            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem' }}
              onClick={() => setCurrentTab('customers')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={16} style={{ color: '#60a5fa' }} />
                <span>Manage Customer CRM</span>
              </div>
              <span className="badge badge-info">{metrics?.totalCustomers || 0} Clients</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem' }}
              onClick={() => setCurrentTab('products')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Package size={16} style={{ color: '#c084fc' }} />
                <span>Product Stock & Inventory</span>
              </div>
              <span className={`badge badge-${lowStockCount > 0 ? 'warning' : 'success'}`}>
                {lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Stock Healthy'}
              </span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem' }}
              onClick={() => setCurrentTab('stock-logs')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ClipboardList size={16} style={{ color: '#10b981' }} />
                <span>Stock Audit Logs</span>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Live System Operations & Inventory Health (REPLACING BUSINESS FLOW OVERVIEW) */}
        <div className="card-panel">
          <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
              System Operations & Inventory Health
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Inventory Health Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={14} style={{ color: '#10b981' }} />
                  Inventory Health Level
                </span>
                <span style={{ fontWeight: 600, color: stockHealthPct > 75 ? '#10b981' : '#f59e0b' }}>
                  {stockHealthPct}% Healthy
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${stockHealthPct}%`,
                    background: stockHealthPct > 75 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>{healthyStockCount} Adequate Stock Items</span>
                <span>{lowStockCount} Need Restock</span>
              </div>
            </div>

            {/* Metrics Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Avg Order Value</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                  ₹{avgOrderValue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Per confirmed challan</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>CRM Client Ratio</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }}>
                  {metrics?.activeCustomers || 0} / {metrics?.totalCustomers || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Active Accounts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Challans Table */}
      <div className="card-panel">
        <div className="panel-header">
          <h3 className="panel-title">Recent Sales Challans</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('challans')}>
            View All Challans
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentChallans.map((challan) => (
                <tr key={challan.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {challan.challanNumber}
                  </td>
                  <td>{challan.customer?.name} ({challan.customer?.businessName})</td>
                  <td>{challan.totalQuantity} units</td>
                  <td style={{ fontWeight: 600 }}>₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        challan.status === 'CONFIRMED'
                          ? 'success'
                          : challan.status === 'DRAFT'
                          ? 'warning'
                          : 'danger'
                      }`}
                    >
                      {challan.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(challan.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentChallans.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent challans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

