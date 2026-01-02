import React from 'react'
import '../pages/warehouse.css'

/**
 * Modal form for creating or editing a warehouse.
 * @param {Object} props
 * @param {Object} props.form - Current form state
 * @param {Function} props.setForm - Setter for form state
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSubmit - Submit callback
 */
function WarehouseFormModal({ form, setForm, open, onClose, onSubmit }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h3>{form.id ? 'Edit' : 'Create'} Warehouse</h3>
        <form onSubmit={onSubmit} className="modal-form">
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WarehouseFormModal
