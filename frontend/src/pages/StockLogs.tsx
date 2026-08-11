import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StockMovement } from '../types';
import { History, ArrowUpRight, ArrowDownLeft, FileDown } from 'lucide-react';

interface StockLogsProps {
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const StockLogs: React.FC<StockLogsProps> = ({ addToast }) => {
  const [logs, setLogs] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/stock-movements');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        addToast('error', 'Failed to fetch stock movement audit log.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get('/products/stock-movements/pdf', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Stock_Movement_Audit_Logs_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('success', 'Stock Movement Audit Log PDF downloaded successfully!');
    } catch (err) {
      addToast('error', 'Failed to download Stock Movement PDF.');
    }
  };

  return (
    <div>
      <div className="card-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--accent-primary)" />
            <span>Stock Movement Audit Logs</span>
          </h3>
          <button
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={handleDownloadPdf}
          >
            <FileDown size={16} />
            <span>Download Audit PDF</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product & SKU</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Reference</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.product?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      SKU: {log.product?.sku}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${log.movementType === 'IN' ? 'success' : 'warning'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {log.movementType === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      STOCK {log.movementType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {log.movementType === 'IN' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.reason}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{log.createdBy?.name}</div>
                    <span className={`role-badge role-${log.createdBy?.role}`} style={{ fontSize: '0.65rem' }}>
                      {log.createdBy?.role}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No stock movements recorded yet.
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
