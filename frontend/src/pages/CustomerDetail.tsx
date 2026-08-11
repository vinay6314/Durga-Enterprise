import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Customer } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Phone, Mail, Building, MapPin, Calendar, FileText, MessageSquare } from 'lucide-react';
import { Modal } from '../components/Modal';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack, addToast }) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Follow up note modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/customers/${customerId}`);
      if (res.data.success) {
        setCustomer(res.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to fetch customer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [customerId]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await api.post(`/customers/${customerId}/followups`, { note: newNote });
      if (res.data.success) {
        addToast('success', 'Follow-up note logged!');
        setNewNote('');
        setIsFollowUpModalOpen(false);
        fetchDetail();
      }
    } catch (err: any) {
      addToast('error', 'Failed to add follow-up note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading customer timeline...</div>;
  }

  if (!customer) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Customers
        </button>
        <div className="card-panel">Customer not found.</div>
      </div>
    );
  }

  const canAddNotes = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Customers List
      </button>

      {/* Customer Header Info Panel */}
      <div className="card-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{customer.name}</h2>
              <span className={`badge badge-${customer.status === 'ACTIVE' ? 'success' : customer.status === 'LEAD' ? 'warning' : 'danger'}`}>
                {customer.status}
              </span>
              <span className="badge badge-info">{customer.customerType}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {customer.businessName} {customer.gstNumber ? `| GST: ${customer.gstNumber}` : ''}
            </p>
          </div>

          {canAddNotes && (
            <button className="btn btn-primary" onClick={() => setIsFollowUpModalOpen(true)}>
              <Plus size={16} />
              <span>Add Follow-Up Note</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOBILE NUMBER</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Phone size={14} color="var(--accent-primary)" /> {customer.mobile}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMAIL ADDRESS</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Mail size={14} color="var(--accent-primary)" /> {customer.email}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FOLLOW-UP DATE</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Calendar size={14} color="var(--warning)" /> {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None Scheduled'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REGISTERED ADDRESS</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <MapPin size={14} color="var(--success)" /> {customer.address}
            </div>
          </div>
        </div>
      </div>

      {/* CRM Follow-Up Timeline & Order History */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Timeline */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--accent-primary)" />
            <span>CRM Follow-Up Notes & Interactions</span>
          </h3>

          <div className="timeline">
            {customer.followUps && customer.followUps.length > 0 ? (
              customer.followUps.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-card">
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {item.note}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Logged by: {item.createdBy?.name} ({item.createdBy?.role})</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
                No follow-up notes recorded yet. Click "Add Follow-Up Note" to log phone calls or meetings.
              </p>
            )}
          </div>
        </div>

        {/* Sales Challan History */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--info)" />
            <span>Order History</span>
          </h3>

          {customer.challans && customer.challans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {customer.challans.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--accent-primary)' }}>{ch.challanNumber}</span>
                    <span>₹{ch.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>{ch.totalQuantity} units</span>
                    <span className={`badge badge-${ch.status === 'CONFIRMED' ? 'success' : 'warning'}`}>
                      {ch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
              No sales challans recorded for this customer.
            </p>
          )}
        </div>
      </div>

      {/* Add Follow Up Note Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title={`Add Follow-Up Note for ${customer.name}`}
      >
        <form onSubmit={handleAddFollowUp}>
          <div className="form-group">
            <label className="form-label">Follow-Up Note / Activity Summary</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. Called customer regarding bulk order. Agreed to send updated price quote..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFollowUpModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingNote}>
              {submittingNote ? 'Saving...' : 'Log Follow-Up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
