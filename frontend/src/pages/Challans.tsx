import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SalesChallan, ChallanStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Eye, FileText, Download, CheckCircle2, XCircle } from 'lucide-react';

interface ChallansProps {
  onCreateChallan: () => void;
  onSelectChallan: (id: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const Challans: React.FC<ChallansProps> = ({ onCreateChallan, onSelectChallan, addToast }) => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to fetch sales challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: ChallanStatus) => {
    try {
      const res = await api.put(`/challans/${id}/status`, { status: newStatus });
      if (res.data.success) {
        addToast('success', `Challan status updated to ${newStatus}`);
        fetchChallans();
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDownloadPdf = async (id: string, challanNo: string) => {
    try {
      const response = await api.get(`/challans/${id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${challanNo || 'Sales_Challan_Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('success', `Sales Challan PDF (${challanNo}) downloaded successfully!`);
    } catch (err) {
      addToast('error', 'Failed to download Sales Challan PDF.');
    }
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div>
      <div className="panel-header">
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search challan number, customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={onCreateChallan}>
            <Plus size={18} />
            <span>Create Sales Challan</span>
          </button>
        )}
      </div>

      <div className="card-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer</th>
                <th>Total Items & Qty</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ch.challanNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ch.customer?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ch.customer?.businessName}</div>
                  </td>
                  <td>
                    <span>{ch.totalQuantity} units ({ch.items?.length || 0} items)</span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{ch.totalAmount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        ch.status === 'CONFIRMED' ? 'success' : ch.status === 'DRAFT' ? 'warning' : 'danger'
                      }`}
                    >
                      {ch.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectChallan(ch.id)}
                        title="View Detailed Snapshot"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDownloadPdf(ch.id, ch.challanNumber)}
                        title="Download / Print PDF Invoice"
                      >
                        <Download size={14} color="var(--info)" /> PDF
                      </button>

                      {ch.status === 'DRAFT' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                          onClick={() => handleUpdateStatus(ch.id, 'CONFIRMED')}
                          title="Confirm Challan & Deduct Stock"
                        >
                          <CheckCircle2 size={14} /> Confirm
                        </button>
                      )}

                      {ch.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'rgba(239,68,68,0.4)', color: 'var(--danger)' }}
                          onClick={() => handleUpdateStatus(ch.id, 'CANCELLED')}
                          title="Cancel Challan"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {challans.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No sales challans recorded.
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
