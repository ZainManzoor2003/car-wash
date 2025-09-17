import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface BusinessExpense {
  _id?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  supplier?: string;
  notes?: string;
}

interface ExpenseCategory {
  value: string;
  label: string;
}

interface ExpenseManagerProps {
  onClose: () => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ onClose }) => {
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BusinessExpense | null>(null);
  const [formData, setFormData] = useState<BusinessExpense>({
    category: 'equipment',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'card',
    supplier: '',
    notes: ''
  });

  const setFallbackCategories = () => {
    const fallbackCategories = [
      { value: 'equipment', label: 'Equipment & Tools' },
      { value: 'fuel', label: 'Fuel & Transport' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'rent', label: 'Rent & Facilities' },
      { value: 'maintenance', label: 'Equipment Maintenance' },
      { value: 'supplies', label: 'Office & Supplies' },
      { value: 'other', label: 'Other Expenses' }
    ];
    setCategories(fallbackCategories);
    console.log('Fallback categories set:', fallbackCategories);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-expenses/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        console.log('Categories loaded successfully:', data.data);
      } else {
        console.error('API call unsuccessful, using fallback categories');
        setFallbackCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.log('Using fallback categories due to API error');
      setFallbackCategories();
    }
  };

  // Initialize categories immediately to avoid empty dropdown
  useEffect(() => {
    setFallbackCategories(); // Set fallback categories first
    fetchCategories(); // Then try to fetch from API
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-expenses`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExpense 
        ? `${API_BASE_URL}/api/business-expenses/${editingExpense._id}`
        : `${API_BASE_URL}/api/business-expenses`;
      
      const method = editingExpense ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        fetchExpenses(); // Refresh list
        resetForm();
      } else {
        alert('Error saving expense: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-expenses/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchExpenses(); // Refresh list
      } else {
        alert('Error deleting expense: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'equipment',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'card',
      supplier: '',
      notes: ''
    });
    setEditingExpense(null);
    setShowAddForm(false);
  };

  const startEdit = (expense: BusinessExpense) => {
    setFormData({
      ...expense,
      date: expense.date.split('T')[0] // Format date for input
    });
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>
        Loading expenses...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .expense-manager {
          background: #111;
          color: #fff;
          padding: 20px;
          border-radius: 12px;
          max-width: 1000px;
          margin: 0 auto;
          min-height: 80vh;

        }
        .expense-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 2px solid #333;
          padding: 16px 0;
          position: relative;
          z-index: 10;
        }
        .expense-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #ffd600;
          margin: 0;
          line-height: 1.2;
        }
        .expense-actions {
          display: flex;
          gap: 12px;
        }
        .expense-btn {
          background: #ffd600;
          color: #111;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          white-space: nowrap;
        }
        .expense-btn:hover {
          background: #ffed4e;
        }
        .expense-btn-secondary {
          background: #232323;
          color: #fff;
          border: 2px solid #444;
        }
        .expense-btn-secondary:hover {
          background: #333;
        }
        .expense-btn-danger {
          background: #ef4444;
          color: #fff;
        }
        .expense-btn-danger:hover {
          background: #dc2626;
        }
        .expense-form {
          background: #181818;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 2px solid #ffd600;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-label {
          margin-bottom: 6px;
          font-weight: 500;
          color: #ffd600;
        }
        .form-input {
          background: #111;
          color: #fff;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 1rem;
        }
        .form-input:focus {
          outline: none;
          border-color: #ffd600;
          box-shadow: 0 0 0 2px rgba(255, 214, 0, 0.2);
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .expense-list {
          background: #181818;
          border-radius: 12px;
          overflow: hidden;
        }
        .expense-table {
          width: 100%;
          border-collapse: collapse;
        }
        .expense-table th {
          background: #232323;
          color: #ffd600;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #333;
        }
        .expense-table td {
          padding: 16px;
          border-bottom: 1px solid #333;
        }
        .expense-table tbody tr:hover {
          background: #232323;
        }
        .expense-actions-cell {
          display: flex;
          gap: 8px;
        }
        .expense-btn-small {
          padding: 6px 12px;
          font-size: 0.9rem;
        }
        .category-badge {
          background: #ffd600;
          color: #111;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .expense-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .expense-actions {
            display: flex;
            gap: 12px;
            width: 100%;
          }
          .expense-btn {
            flex: 1;
            min-height: 44px;
          }
          .expense-table {
            font-size: 0.9rem;
          }
          .expense-table th,
          .expense-table td {
            padding: 12px 8px;
          }
        }
      `}</style>

      <div className="expense-manager">
        <div className="expense-header">
          <h2 className="expense-title">Business Expense Manager</h2>
          <div className="expense-actions">
            <button 
              className="expense-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Expense'}
            </button>
            <button 
              className="expense-btn expense-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {showAddForm && (
          <form className="expense-form" onSubmit={handleSubmit}>
            <h3 style={{ color: '#ffd600', marginBottom: '16px' }}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.length === 0 ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Supplier name"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Additional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="expense-btn expense-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button type="submit" className="expense-btn">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        )}

        <div className="expense-list">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No expenses recorded yet. Click "Add Expense" to get started.
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span className="category-badge">
                        {categories.find(cat => cat.value === expense.category)?.label || expense.category}
                      </span>
                    </td>
                    <td>{expense.description}</td>
                    <td style={{ fontWeight: '600', color: '#ef4444' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {expense.paymentMethod.replace('_', ' ')}
                    </td>
                    <td>
                      <div className="expense-actions-cell">
                        <button
                          className="expense-btn expense-btn-secondary expense-btn-small"
                          onClick={() => startEdit(expense)}
                        >
                          Edit
                        </button>
                        <button
                          className="expense-btn expense-btn-danger expense-btn-small"
                          onClick={() => expense._id && handleDelete(expense._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExpenseManager; 