import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Customer, Product, ChallanStatus } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

interface CreateChallanProps {
  onBack: () => void;
  onSuccess: (challanId: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface ItemRow {
  productId: string;
  quantity: number;
}

export const CreateChallan: React.FC<CreateChallanProps> = ({ onBack, onSuccess, addToast }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ productId: '', quantity: 1 }]);
  const [status, setStatus] = useState<ChallanStatus>('DRAFT');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);

        if (cRes.data.success) setCustomers(cRes.data.data);
        if (pRes.data.success) setProducts(pRes.data.data);
      } catch (err) {
        addToast('error', 'Failed to load master customer & product catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  // Calculations
  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalQty = 0;
  let totalAmount = 0;
  let hasStockError = false;
  let stockErrorMessage = '';

  items.forEach((item) => {
    if (item.productId) {
      const p = productMap.get(item.productId);
      if (p) {
        totalQty += Number(item.quantity) || 0;
        totalAmount += (p.unitPrice || 0) * (Number(item.quantity) || 0);

        if (status === 'CONFIRMED' && p.currentStock < item.quantity) {
          hasStockError = true;
          stockErrorMessage = `Insufficient stock for ${p.name}. Available: ${p.currentStock}, Requested: ${item.quantity}`;
        }
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      addToast('error', 'Please select a customer.');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      addToast('error', 'Please add at least one valid product line item.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        status,
        items: validItems,
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        addToast('success', `Sales Challan ${res.data.data.challanNumber} created!`);
        onSuccess(res.data.data.id);
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to create Sales Challan.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Challans List
      </button>

      <div className="card-panel">
        <h2 className="panel-title" style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
          Create New Sales Challan / Invoice
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Select Customer</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) - {c.customerType}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Challan Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ChallanStatus)}
              >
                <option value="DRAFT">DRAFT (Save without deducting stock)</option>
                <option value="CONFIRMED">CONFIRMED (Verify stock & deduct immediately)</option>
              </select>
            </div>
          </div>

          {/* Selected Customer Snapshot Card */}
          {selectedCustomerObj && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <strong style={{ color: 'var(--accent-primary)' }}>{selectedCustomerObj.name}</strong> ({selectedCustomerObj.businessName})
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Address: {selectedCustomerObj.address} | Phone: {selectedCustomerObj.mobile} | GST: {selectedCustomerObj.gstNumber || 'N/A'}
              </div>
            </div>
          )}

          {/* Line Items Builder */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Line Items</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                <Plus size={14} /> Add Product Line
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Available Stock</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Line Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const product = productMap.get(row.productId);
                    const lineTotal = product ? product.unitPrice * row.quantity : 0;
                    const stockLow = product && status === 'CONFIRMED' && product.currentStock < row.quantity;

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ minWidth: '240px' }}>
                          <select
                            className="form-select"
                            value={row.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            required
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) - ₹{p.unitPrice}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {product ? (
                            <span style={{ color: stockLow ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                              {product.currentStock} units
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{product ? `₹${product.unitPrice.toFixed(2)}` : '₹0.00'}</td>
                        <td style={{ width: '120px' }}>
                          <input
                            type="number"
                            min="1"
                            className="form-input"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                            required
                          />
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{lineTotal.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={items.length === 1}
                          >
                            <Trash2 size={14} color="var(--danger)" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Warning Banner */}
          {hasStockError && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={18} />
              <span>{stockErrorMessage}</span>
            </div>
          )}

          {/* Summary Box */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL QUANTITY:</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalQty} units</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GRAND TOTAL AMOUNT:</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || (status === 'CONFIRMED' && hasStockError)}
            >
              {status === 'CONFIRMED' ? <CheckCircle2 size={18} /> : <Save size={18} />}
              <span>{submitting ? 'Generating...' : `Save Sales Challan as ${status}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
