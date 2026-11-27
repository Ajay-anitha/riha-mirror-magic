import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const PRODUCT_CATEGORIES = [
  'Skin Care',
  'Hair Care',
  'Bridal Makeup',
  'Tailoring',
  'Accessories',
  'Other'
];

function parseNumericPrice(unitPrice, sellingPrice) {
  if (typeof sellingPrice === 'number' && !isNaN(sellingPrice)) return sellingPrice;
  const parsed = parseFloat(String(unitPrice || '0').replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

function getStockBadgeInfo(qty) {
  const n = Number(qty) || 0;
  if (n === 0) {
    return { label: 'Out of Stock', className: 'danger', text: 'Out of Stock' };
  }
  if (n < 5) {
    return { label: `${n}`, className: 'warning', text: `${n} (Low Stock)` };
  }
  return { label: `${n}`, className: 'success', text: `${n}` };
}

export default function AdminFinanceProductsStock() {
  const { isOwner, adminUser } = useAdminAuth();

  // Add Product form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [prodSellingPrice, setProdSellingPrice] = useState('');
  const [prodInitialQty, setProdInitialQty] = useState('');
  const [prodError, setProdError] = useState('');
  const [prodSuccess, setProdSuccess] = useState('');

  // Add Stock form states
  const [stockProductId, setStockProductId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockDate, setStockDate] = useState(() => formatLocalDateYMD());
  const [showStockCalendar, setShowStockCalendar] = useState(false);
  const [stockNotes, setStockNotes] = useState('');
  const [stockError, setStockError] = useState('');
  const [stockSuccess, setStockSuccess] = useState('');

  // Three-dot menu, Edit & Delete Modals
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdForm, setEditProdForm] = useState({ name: '', category: '', sellingPrice: '', initialStock: '' });
  const [editProdError, setEditProdError] = useState('');

  const [editingStock, setEditingStock] = useState(null);
  const [editStockForm, setEditStockForm] = useState({ quantity: '', date: '', notes: '' });
  const [showEditStockCalendar, setShowEditStockCalendar] = useState(false);
  const [editStockError, setEditStockError] = useState('');

  const [deletingTarget, setDeletingTarget] = useState(null); // { type: 'product'|'stock_addition', id, label }
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const handleSync = () => setRefreshTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Verify Owner-only backend access when a backend token is active
  useEffect(() => {
    if (!isOwner || !adminUser?.token) return;
    fetch('/api/admin/finance/products-stock', {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser]);

  // Close three-dot dropdown on outside mousedown or scroll
  useEffect(() => {
    if (!activeMenuId) return;

    const handleOutsideMouseDown = (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest('[data-dots-menu]')) {
        return;
      }
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    const handleCloseOnScroll = () => {
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    const mainContent = document.getElementById('adminMainContent');
    if (mainContent) mainContent.addEventListener('scroll', handleCloseOnScroll, { passive: true });
    window.addEventListener('resize', handleCloseOnScroll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      if (mainContent) mainContent.removeEventListener('scroll', handleCloseOnScroll);
      window.removeEventListener('resize', handleCloseOnScroll);
    };
  }, [activeMenuId]);

  const handleToggleDotsMenu = (e, menuId) => {
    e.stopPropagation();
    if (activeMenuId === menuId) {
      setActiveMenuId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < 105;
    setMenuPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined
    });
    setActiveMenuId(menuId);
  };

  const stockData = useMemo(() => {
    return adminDataService.getProductsStockData();
  }, [refreshTick]);

  // Keep default Add Stock product selection valid
  useEffect(() => {
    if (stockData.products.length > 0 && !stockData.products.some((p) => p.id === stockProductId)) {
      setStockProductId(stockData.products[0].id);
    }
  }, [stockData.products, stockProductId]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProdError('');
    setProdSuccess('');
    if (!isOwner) return;

    const cleanName = prodName.trim();
    const numPrice = prodSellingPrice === '' ? 0 : parseFloat(prodSellingPrice);
    const numQty = prodInitialQty === '' ? 0 : parseInt(prodInitialQty, 10);

    if (!cleanName) {
      setProdError('Please enter a product name.');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setProdError('Selling price cannot be negative.');
      return;
    }
    if (isNaN(numQty) || numQty < 0) {
      setProdError('Initial quantity cannot be negative.');
      return;
    }

    const saved = adminDataService.addProduct({
      name: cleanName,
      category: prodCategory,
      sellingPrice: numPrice,
      initialStock: numQty
    });

    if (!saved) {
      setProdError('Failed to add product.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/products-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({ actionType: 'product', ...saved })
        });
      } catch (_) {}
    }

    setProdName('');
    setProdSellingPrice('');
    setProdInitialQty('');
    setStockProductId(saved.id);
    setProdSuccess(`Product "${saved.name}" added.`);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setProdSuccess(''), 4000);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setStockError('');
    setStockSuccess('');
    if (!isOwner) return;

    const numQty = parseInt(stockQty, 10);
    if (!stockProductId) {
      setStockError('Please select a product.');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      setStockError('Quantity to add must be greater than zero.');
      return;
    }
    if (!stockDate) {
      setStockError('Please select a date.');
      return;
    }

    const saved = adminDataService.addStockEntry({
      productId: stockProductId,
      quantity: numQty,
      date: stockDate,
      notes: stockNotes.trim()
    });

    if (!saved) {
      setStockError('Failed to record stock addition.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/products-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({ actionType: 'stock', ...saved })
        });
      } catch (_) {}
    }

    setStockQty('');
    setStockNotes('');
    setStockSuccess(`Added ${saved.quantity} units to "${saved.productName}".`);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setStockSuccess(''), 4000);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditProdForm({
      name: prod.name || '',
      category: prod.category || PRODUCT_CATEGORIES[0],
      sellingPrice: parseNumericPrice(prod.unitPrice, prod.sellingPrice),
      initialStock: prod.initialStock ?? prod.stock ?? 0
    });
    setEditProdError('');
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingProduct) return;
    setEditProdError('');

    const cleanName = editProdForm.name.trim();
    const numPrice = parseFloat(editProdForm.sellingPrice);
    const numInitial = parseInt(editProdForm.initialStock, 10);

    if (!cleanName) {
      setEditProdError('Product name is required.');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setEditProdError('Selling price cannot be negative.');
      return;
    }
    if (isNaN(numInitial) || numInitial < 0) {
      setEditProdError('Initial quantity cannot be negative.');
      return;
    }

    const updated = adminDataService.updateProduct(editingProduct.id, {
      name: cleanName,
      category: editProdForm.category,
      sellingPrice: numPrice,
      initialStock: numInitial
    });

    if (!updated) {
      setEditProdError('Failed to update product.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/products-stock', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({ actionType: 'product', ...updated })
        });
      } catch (_) {}
    }

    setEditingProduct(null);
    setRefreshTick((t) => t + 1);
  };

  const openEditStock = (histItem) => {
    setEditingStock(histItem);
    setEditStockForm({
      quantity: histItem.quantity || 1,
      date: histItem.date || formatLocalDateYMD(),
      notes: histItem.notes || ''
    });
    setShowEditStockCalendar(false);
    setEditStockError('');
  };

  const handleSaveEditStock = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingStock) return;
    setEditStockError('');

    const numQty = parseInt(editStockForm.quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      setEditStockError('Quantity must be greater than zero.');
      return;
    }
    if (!editStockForm.date) {
      setEditStockError('Date is required.');
      return;
    }

    const updated = adminDataService.updateStockEntry(editingStock.sourceId, {
      quantity: numQty,
      date: editStockForm.date,
      notes: editStockForm.notes.trim()
    });

    if (!updated) {
      setEditStockError('Failed to update stock record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/products-stock', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({ actionType: 'stock', ...updated })
        });
      } catch (_) {}
    }

    setEditingStock(null);
    setRefreshTick((t) => t + 1);
  };

  const handleConfirmDelete = async () => {
    if (!isOwner || !deletingTarget) return;
    const { type, id } = deletingTarget;
    if (type === 'product') {
      adminDataService.deleteProduct(id);
    } else if (type === 'stock_addition') {
      adminDataService.deleteStockEntry(id);
    }

    if (adminUser?.token) {
      try {
        const actionType = type === 'stock_addition' ? 'stock' : 'product';
        await fetch(
          `/api/admin/finance/products-stock?actionType=${encodeURIComponent(actionType)}&id=${encodeURIComponent(id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminUser.token}` }
          }
        );
      } catch (_) {}
    }

    setDeletingTarget(null);
    setRefreshTick((t) => t + 1);
  };

  if (!isOwner) {
    return (
      <div className="admin-page-view">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
              ←
            </Link>
            <h1 className="admin-page-title">Products &amp; Stock</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Products &amp; Stock records and management are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  const { summary, products, history } = stockData;

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Products &amp; Stock</h1>
        </div>
      </div>

      {/* Section 1: Stock Summary */}
      <section className="admin-panel-card admin-income-section" aria-label="Stock Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Stock Summary
        </h2>
        <div className="admin-expense-summary-grid">
          <div className="admin-income-summary-box total">
            <span className="admin-income-summary-label">Total Products</span>
            <span className="admin-income-summary-value" data-testid="stock-total-products">
              {summary.totalProducts}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Total Units in Stock</span>
            <span className="admin-income-summary-value" data-testid="stock-total-units">
              {summary.totalUnits}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Low Stock (1–5)</span>
            <span
              className="admin-income-summary-value"
              style={{ color: summary.lowStockCount > 0 ? 'var(--admin-warning)' : 'var(--admin-navy)' }}
              data-testid="stock-low-count"
            >
              {summary.lowStockCount}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Out of Stock</span>
            <span
              className="admin-income-summary-value"
              style={{ color: summary.outOfStockCount > 0 ? 'var(--admin-danger)' : 'var(--admin-navy)' }}
              data-testid="stock-out-count"
            >
              {summary.outOfStockCount}
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Product Records */}
      <section className="admin-panel-card admin-income-section" aria-label="Product Records">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Product Records
        </h2>
        {products.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Selling Price</th>
                  <th style={{ textAlign: 'right' }}>Available Quantity</th>
                  <th style={{ width: '45px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const badge = getStockBadgeInfo(prod.stock);
                  const menuId = `prod_${prod.id}`;
                  return (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{prod.name}</td>
                      <td>{prod.category}</td>
                      <td className="num-col" style={{ fontWeight: 600 }}>
                        {prod.unitPrice || `₹${parseNumericPrice(prod.unitPrice, prod.sellingPrice).toLocaleString('en-IN')}`}
                      </td>
                      <td className="num-col">
                        <span className={`admin-status-pill ${badge.className}`}>{badge.text}</span>
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            type="button"
                            className="admin-dots-menu-btn"
                            aria-label="Actions"
                            aria-expanded={activeMenuId === menuId}
                            onClick={(e) => handleToggleDotsMenu(e, menuId)}
                          >
                            &#8942;
                          </button>
                          {activeMenuId === menuId && menuPosition && (
                            <div
                              className="admin-dots-dropdown-menu fixed-menu"
                              role="menu"
                              style={{
                                right: `${menuPosition.right}px`,
                                top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
                                bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto'
                              }}
                            >
                              <button
                                type="button"
                                className="admin-dots-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  setMenuPosition(null);
                                  openEditProduct(prod);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-dots-menu-item danger"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  setMenuPosition(null);
                                  setDeletingTarget({ type: 'product', id: prod.id, label: prod.name });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No product records found</div>
        )}
      </section>

      {/* Section 3: Add Product */}
      <section className="admin-panel-card admin-income-section" aria-label="Add Product">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Add Product
        </h2>
        {prodError && (
          <div className="admin-income-alert error" role="alert">
            {prodError}
          </div>
        )}
        {prodSuccess && (
          <div className="admin-income-alert success" role="status">
            ✓ {prodSuccess}
          </div>
        )}
        <form onSubmit={handleAddProduct}>
          <div className="admin-expense-form-grid">
            <div>
              <label className="admin-form-label" htmlFor="add-prod-name">
                Product Name
              </label>
              <input
                id="add-prod-name"
                type="text"
                className="admin-form-input"
                placeholder="e.g. Herbal Hair Serum"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label" htmlFor="add-prod-category">
                Category
              </label>
              <select
                id="add-prod-category"
                className="admin-form-input"
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="add-prod-price">
                Selling Price (₹)
              </label>
              <input
                id="add-prod-price"
                type="number"
                min="0"
                step="any"
                className="admin-form-input"
                placeholder="0"
                value={prodSellingPrice}
                onChange={(e) => setProdSellingPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label" htmlFor="add-prod-qty">
                Initial Quantity
              </label>
              <input
                id="add-prod-qty"
                type="number"
                min="0"
                step="1"
                className="admin-form-input"
                placeholder="0"
                value={prodInitialQty}
                onChange={(e) => setProdInitialQty(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              Add Product
            </button>
          </div>
        </form>
      </section>

      {/* Section 4: Add Stock */}
      <section className="admin-panel-card admin-income-section" aria-label="Add Stock">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Add Stock
        </h2>
        {stockError && (
          <div className="admin-income-alert error" role="alert">
            {stockError}
          </div>
        )}
        {stockSuccess && (
          <div className="admin-income-alert success" role="status">
            ✓ {stockSuccess}
          </div>
        )}
        <form onSubmit={handleAddStock}>
          <div className="admin-expense-form-grid">
            <div>
              <label className="admin-form-label" htmlFor="add-stock-product">
                Product
              </label>
              <select
                id="add-stock-product"
                className="admin-form-input"
                value={stockProductId}
                onChange={(e) => setStockProductId(e.target.value)}
                required
              >
                {products.length === 0 ? (
                  <option value="">No products available</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="add-stock-qty">
                Quantity to Add
              </label>
              <input
                id="add-stock-qty"
                type="number"
                min="1"
                step="1"
                className="admin-form-input"
                placeholder="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label className="admin-form-label" htmlFor="add-stock-date">
                Date
              </label>
              <div className="admin-search-input-box">
                <input
                  id="add-stock-date"
                  type="text"
                  readOnly
                  className="admin-form-input admin-date-picker-trigger"
                  placeholder="YYYY-MM-DD"
                  value={stockDate}
                  onClick={() => setShowStockCalendar((prev) => !prev)}
                  required
                />
                <button
                  type="button"
                  className="admin-calendar-icon-btn"
                  onClick={() => setShowStockCalendar((prev) => !prev)}
                  aria-label="Open calendar"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
                {showStockCalendar && (
                  <AdminCalendarPopup
                    selectedDate={stockDate}
                    onSelectDate={(d) => {
                      setStockDate(d);
                      setShowStockCalendar(false);
                    }}
                    onClear={() => {
                      setStockDate('');
                      setShowStockCalendar(false);
                    }}
                    onClose={() => setShowStockCalendar(false)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="add-stock-notes">
                Notes (Optional)
              </label>
              <input
                id="add-stock-notes"
                type="text"
                className="admin-form-input"
                placeholder="Optional restock note..."
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={products.length === 0}>
              Add Stock
            </button>
          </div>
        </form>
      </section>

      {/* Section 5: Stock History */}
      <section className="admin-panel-card admin-income-section" aria-label="Stock History">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Stock History
        </h2>
        {history.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event Type</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th>Notes / Reference</th>
                  <th style={{ width: '45px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const menuId = `hist_${item.id}`;
                  const pillClass =
                    item.eventType === 'Product Added'
                      ? 'info'
                      : item.eventType === 'Stock Added'
                        ? 'success'
                        : 'warning';
                  const canEditDelete = item.editableType === 'product' || item.editableType === 'stock_addition';

                  return (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
                      <td>
                        <span className={`admin-status-pill ${pillClass}`}>{item.eventType}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{item.productName}</td>
                      <td className="num-col" style={{ fontWeight: 700 }}>
                        {item.eventType === 'Product Sold' ? `-${item.quantity}` : `+${item.quantity}`}
                      </td>
                      <td>{item.notes || '—'}</td>
                      <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        {canEditDelete ? (
                          <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className="admin-dots-menu-btn"
                              aria-label="Actions"
                              aria-expanded={activeMenuId === menuId}
                              onClick={(e) => handleToggleDotsMenu(e, menuId)}
                            >
                              &#8942;
                            </button>
                            {activeMenuId === menuId && menuPosition && (
                              <div
                                className="admin-dots-dropdown-menu fixed-menu"
                                role="menu"
                                style={{
                                  right: `${menuPosition.right}px`,
                                  top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
                                  bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto'
                                }}
                              >
                                <button
                                  type="button"
                                  className="admin-dots-menu-item"
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setMenuPosition(null);
                                    if (item.editableType === 'product') {
                                      const prod = products.find((p) => p.id === item.sourceId);
                                      if (prod) openEditProduct(prod);
                                    } else {
                                      openEditStock(item);
                                    }
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="admin-dots-menu-item danger"
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setMenuPosition(null);
                                    setDeletingTarget({
                                      type: item.editableType,
                                      id: item.sourceId,
                                      label: `${item.eventType}: ${item.productName}`
                                    });
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No stock history recorded</div>
        )}
      </section>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Product</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingProduct(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditProduct}>
              <div className="admin-modal-body">
                {editProdError && (
                  <div className="admin-income-alert error" role="alert">
                    {editProdError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="edit-prod-name">
                    Product Name
                  </label>
                  <input
                    id="edit-prod-name"
                    type="text"
                    className="admin-form-input"
                    value={editProdForm.name}
                    onChange={(e) => setEditProdForm({ ...editProdForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-prod-category">
                    Category
                  </label>
                  <select
                    id="edit-prod-category"
                    className="admin-form-input"
                    value={editProdForm.category}
                    onChange={(e) => setEditProdForm({ ...editProdForm, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-prod-price">
                    Selling Price (₹)
                  </label>
                  <input
                    id="edit-prod-price"
                    type="number"
                    min="0"
                    step="any"
                    className="admin-form-input"
                    value={editProdForm.sellingPrice}
                    onChange={(e) => setEditProdForm({ ...editProdForm, sellingPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-prod-initial">
                    Initial Quantity
                  </label>
                  <input
                    id="edit-prod-initial"
                    type="number"
                    min="0"
                    step="1"
                    className="admin-form-input"
                    value={editProdForm.initialStock}
                    onChange={(e) => setEditProdForm({ ...editProdForm, initialStock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Addition Modal */}
      {editingStock && (
        <div className="admin-modal-overlay" onClick={() => setEditingStock(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Stock Entry – {editingStock.productName}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingStock(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditStock}>
              <div className="admin-modal-body">
                {editStockError && (
                  <div className="admin-income-alert error" role="alert">
                    {editStockError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="edit-stock-qty">
                    Quantity Added
                  </label>
                  <input
                    id="edit-stock-qty"
                    type="number"
                    min="1"
                    step="1"
                    className="admin-form-input"
                    value={editStockForm.quantity}
                    onChange={(e) => setEditStockForm({ ...editStockForm, quantity: e.target.value })}
                    required
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label className="admin-form-label" htmlFor="edit-stock-date">
                    Date
                  </label>
                  <div className="admin-search-input-box">
                    <input
                      id="edit-stock-date"
                      type="text"
                      readOnly
                      className="admin-form-input admin-date-picker-trigger"
                      value={editStockForm.date}
                      onClick={() => setShowEditStockCalendar((prev) => !prev)}
                      required
                    />
                    <button
                      type="button"
                      className="admin-calendar-icon-btn"
                      onClick={() => setShowEditStockCalendar((prev) => !prev)}
                      aria-label="Open calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                    {showEditStockCalendar && (
                      <AdminCalendarPopup
                        selectedDate={editStockForm.date}
                        onSelectDate={(d) => {
                          setEditStockForm((prev) => ({ ...prev, date: d }));
                          setShowEditStockCalendar(false);
                        }}
                        onClear={() => {
                          setEditStockForm((prev) => ({ ...prev, date: '' }));
                          setShowEditStockCalendar(false);
                        }}
                        onClose={() => setShowEditStockCalendar(false)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-stock-notes">
                    Notes (Optional)
                  </label>
                  <input
                    id="edit-stock-notes"
                    type="text"
                    className="admin-form-input"
                    value={editStockForm.notes}
                    onChange={(e) => setEditStockForm({ ...editStockForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingStock(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeletingTarget(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {deletingTarget.type === 'product' ? 'Delete Product' : 'Delete Stock Entry'}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingTarget(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-body-text" style={{ margin: 0 }}>
                Are you sure you want to delete <strong>{deletingTarget.label}</strong>? Available stock quantities and history will be updated automatically.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeletingTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
