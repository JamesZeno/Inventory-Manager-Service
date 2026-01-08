import React from 'react';
import '../pages/warehouse.css';

/**
 * Modal form for creating or editing an allowed SKU.
 * @param {Object} props
 * @param {Object} props.form - Current form state
 * @param {Function} props.setForm - Setter for form state
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSubmit - Submit callback
 */
function AllowedSKUFormModal({ form, setForm, open, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h3 style={{ textAlign: 'center' }}>{form.id ? 'Edit' : 'Create'} SKU</h3>
        <form onSubmit={onSubmit} className="modal-form">
          <label>SKU</label>
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
            required
          />
          <label>Description</label>
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
          <button type="submit" className="btn-primary">
            Save
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AllowedSKUFormModal;
