import React from 'react'
import '../pages/warehouse.css'

/**
 * Table row component for a warehouse.
 * @param {Object} props
 * @param {Object} props.warehouse - Warehouse data
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 */
function WarehouseTableRow({ warehouse, onEdit, onDelete }) {
  return (
    <tr className="warehouse-row">
      <td className="cell-padding">{warehouse.id}</td>
      <td className="cell-padding">{warehouse.name}</td>
      <td className="cell-padding">{warehouse.location}</td>
      <td className="cell-padding">
        <button className="btn-edit" onClick={() => onEdit(warehouse)}>
          Edit
        </button>
        <button onClick={() => onDelete(warehouse.id)}>Delete</button>
      </td>
    </tr>
  )
}

export default WarehouseTableRow
