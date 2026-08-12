import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Eye, Edit2, Trash2, Phone, Mail, Building, FileSpreadsheet } from 'lucide-react';

interface CustomersProps {
  onSelectCustomer: (customerId: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ onSelectCustomer, addToast }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err: any) {
      addToast('error', 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      followUpDate: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      email: c.email,
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      followUpDate: c.followUpDate ? c.followUpDate.split('T')[0] : '',
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        addToast('success', 'Customer profile updated successfully!');
      } else {
        await api.post('/customers', formData);
        addToast('success', 'New customer created successfully!');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to save customer.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    try {
      await api.delete(`/customers/${deletingCustomer.id}`);
      addToast('success', `Customer "${deletingCustomer.name}" deleted successfully.`);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to delete customer.');
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div>
      <div className="panel-header">
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, business, email, phone..."
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
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>

        {canEdit && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      <div className="card-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer & Business</th>
                <th>Contact Info</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {c.businessName} {c.gstNumber ? `| GST: ${c.gstNumber}` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{c.mobile}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{c.customerType}</span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectCustomer(c.id)}
                        title="View Customer Detail"
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingCustomer(c)}
                          title="Delete Customer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No customers found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer CRM Details' : 'Create New Customer'}
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select
                className="form-select"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        title="Delete Customer Confirmation"
      >
        <div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Are you sure you want to delete customer <strong>"{deletingCustomer?.name}"</strong> ({deletingCustomer?.businessName})?
          </p>
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            ⚠️ Warning: This action will permanently remove the customer record and all related follow-up notes.
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setDeletingCustomer(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteCustomer}>
              Delete Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
