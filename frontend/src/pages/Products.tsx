import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Product, MovementType } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, AlertTriangle, ArrowUpDown, Edit2, PackageCheck, Trash2 } from 'lucide-react';

interface ProductsProps {
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ addToast }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete confirmation
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 10,
    location: '',
  });

  // Stock Movement Form
  const [stockForm, setStockForm] = useState({
    quantityChanged: 1,
    movementType: 'IN' as MovementType,
    reason: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (lowStockOnly) params.lowStockOnly = 'true';

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err: any) {
      addToast('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockOnly]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: '',
      unitPrice: 100,
      currentStock: 10,
      minStockAlert: 5,
      location: 'Main Warehouse',
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      location: p.location,
    });
    setIsProductModalOpen(true);
  };

  const openStockModal = (p: Product) => {
    setSelectedProduct(p);
    setStockForm({
      quantityChanged: 1,
      movementType: 'IN',
      reason: 'Stock Inventory Adjustment',
    });
    setIsStockModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
        addToast('success', 'Product updated successfully!');
      } else {
        await api.post('/products', productForm);
        addToast('success', 'New product added to inventory!');
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to save product.');
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.post(`/products/${selectedProduct.id}/stock-movement`, stockForm);
      addToast('success', `Stock adjusted for ${selectedProduct.name}`);
      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Stock adjustment failed.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteConfirmProduct.id}`);
      addToast('success', `"${deleteConfirmProduct.name}" deleted from inventory.`);
      setDeleteConfirmProduct(null);
      fetchProducts();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div>
      <div className="panel-header">
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search product name, SKU, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span style={{ color: lowStockOnly ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
              Low Stock Warnings Only
            </span>
          </label>
        </div>

        {canEdit && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      <div className="card-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLowStock = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{p.unitPrice.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: isLowStock ? 'var(--warning)' : 'var(--success)',
                          }}
                        >
                          {p.currentStock}
                        </span>
                        {isLowStock && (
                          <span className="badge badge-warning" title={`Min Alert: ${p.minStockAlert}`}>
                            <AlertTriangle size={12} /> Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.location}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canEdit && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openStockModal(p)}
                              title="Adjust Stock Quantity (IN/OUT)"
                            >
                              <ArrowUpDown size={14} /> Stock
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditModal(p)}
                              title="Edit Product Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => setDeleteConfirmProduct(p)}
                              title="Delete Product"
                              style={{
                                background: 'rgba(239,68,68,0.12)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.3)',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No products match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">SKU / Item Code</label>
              <input
                type="text"
                className="form-input"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tools, Electronics, Safety"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={productForm.unitPrice}
                onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Stock</label>
              <input
                type="number"
                className="form-input"
                value={productForm.currentStock}
                onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert</label>
              <input
                type="number"
                className="form-input"
                value={productForm.minStockAlert}
                onChange={(e) => setProductForm({ ...productForm, minStockAlert: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse / Bin Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rack A-12, Zone 2"
              value={productForm.location}
              onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock Level for ${selectedProduct?.name}`}
      >
        <form onSubmit={handleStockAdjustment}>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Current Available Stock: <strong style={{ color: '#fff' }}>{selectedProduct?.currentStock} units</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select
                className="form-select"
                value={stockForm.movementType}
                onChange={(e) => setStockForm({ ...stockForm, movementType: e.target.value as MovementType })}
              >
                <option value="IN">IN (Stock Arrival / Addition)</option>
                <option value="OUT">OUT (Stock Dispatch / Removal)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={stockForm.quantityChanged}
                onChange={(e) => setStockForm({ ...stockForm, quantityChanged: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Reference PO</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PO Receipt, Damage write-off, Vendor Return"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStockModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmProduct}
        onClose={() => setDeleteConfirmProduct(null)}
        title="Delete Product"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <Trash2 size={28} color="#f87171" />
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Delete &quot;{deleteConfirmProduct?.name}&quot;?
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            This will permanently remove the product and all its stock movement logs.
            This action <strong style={{ color: '#f87171' }}>cannot be undone</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteConfirmProduct(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={handleDeleteProduct}
              disabled={deleting}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                border: 'none',
              }}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
