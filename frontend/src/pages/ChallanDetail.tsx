import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SalesChallan } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, CheckCircle2, XCircle, FileText, UserCheck, Calendar } from 'lucide-react';
import { DurgaLogo } from '../components/DurgaLogo';
import { StampSeal } from '../components/StampSeal';

interface ChallanDetailProps {
  challanId: string;
  onBack: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ChallanDetail: React.FC<ChallanDetailProps> = ({ challanId, onBack, addToast }) => {
  const { user } = useAuth();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/challans/${challanId}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to fetch challan snapshot details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [challanId]);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/challans/${challanId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${challan?.challanNumber || 'Sales_Challan_Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('success', `Sales Challan PDF (${challan?.challanNumber}) downloaded successfully!`);
    } catch (err) {
      addToast('error', 'Failed to download Sales Challan PDF.');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await api.put(`/challans/${challanId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast('success', `Challan status updated to ${newStatus}`);
        fetchDetail();
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to update status.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading Challan Details...</div>;
  }

  if (!challan) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Challans List
        </button>
        <div className="card-panel">Challan not found.</div>
      </div>
    );
  }

  const customerSnapshot = typeof challan.customerSnapshot === 'string'
    ? JSON.parse(challan.customerSnapshot)
    : challan.customerSnapshot || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Challans List
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            <Download size={16} /> Export / Print PDF Invoice
          </button>
          {challan.status === 'DRAFT' && (
            <button className="btn btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleUpdateStatus('CONFIRMED')}>
              <CheckCircle2 size={16} /> Confirm Challan
            </button>
          )}
        </div>
      </div>

      {/* Snapshot Document Paper view */}
      <div className="card-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DurgaLogo size={48} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                OFFICIAL SALES CHALLAN
              </h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Durga Enterprise Distribution Network
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{challan.challanNumber}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Date: {new Date(challan.createdAt).toLocaleDateString()}
            </div>
            <span className={`badge badge-${challan.status === 'CONFIRMED' ? 'success' : challan.status === 'DRAFT' ? 'warning' : 'danger'}`} style={{ marginTop: '0.5rem' }}>
              {challan.status}
            </span>
          </div>
        </div>

        {/* Immutable Customer Snapshot */}
        <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            CUSTOMER SNAPSHOT DETAILS
          </h3>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {customerSnapshot.name} ({customerSnapshot.businessName})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>Mobile: {customerSnapshot.mobile}</div>
            <div>Email: {customerSnapshot.email}</div>
            <div>GST: {customerSnapshot.gstNumber || 'N/A'}</div>
            <div>Address: {customerSnapshot.address}</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="table-responsive" style={{ marginBottom: '2rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Snapshot</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, idx) => {
                const prod = typeof item.productSnapshot === 'string'
                  ? JSON.parse(item.productSnapshot)
                  : item.productSnapshot || {};

                return (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        SKU: {prod.sku} | Category: {prod.category}
                      </div>
                    </td>
                    <td>{item.quantity} units</td>
                    <td>₹{item.unitPrice.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>₹{item.lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Summary & Authorized Signatory Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Issued by: <strong style={{ color: 'var(--text-primary)' }}>{user?.name || challan.createdBy?.name}</strong> ({user?.role || challan.createdBy?.role})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Computer generated invoice snapshot. Subject to Durga Enterprise jurisdiction.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GRAND TOTAL AMOUNT:</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{challan.totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Official Stamp & Authorized Signatory Block */}
            <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                For DURGA ENTERPRISE
              </div>
              <StampSeal size={90} name={user?.name || challan.createdBy?.name || 'B.N.V. Vinay'} />
              <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
