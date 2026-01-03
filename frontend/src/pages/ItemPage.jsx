import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './warehouse.css';

function ItemPage() {
  const { API, token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', qty: 0, warehouseId: 1 });

  useEffect(() => {
    loadWarehouses();
    loadItems();
  }, []);

  const loadWarehouses = async () => {
    try {
      const res = await axios.get(`${API}/api/warehouses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(res.data);
      if (res.data.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(res.data[0].id);
      }
    } catch (e) {
      console.error('loadWarehouses', e);
    }
  };

  const loadItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items`);
      const all = res.data;
      if (selectedWarehouse) {
        setItems(all.filter((i) => i.warehouseId === selectedWarehouse));
      } else {
        setItems(all);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/api/items`, {
      sku: form.sku,
      name: form.name,
      quantity: Number(form.qty),
      warehouseId: Number(form.warehouseId),
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setForm({ sku: '', name: '', qty: 0, warehouseId: selectedWarehouse || 1 });
    loadItems();
  };

  const updateItem = async (id) => {
    const newName = prompt('New name');
    if (!newName) return;
    await axios.put(`${API}/api/items/${id}`, { name: newName, description: '', quantity: 0 }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadItems();
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/api/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadItems();
  };

  return (
    <div className="warehouses-container">
      <div className="warehouses-header">
        <h2>Items</h2>
        <div className="filter-select">
          <label htmlFor="warehouse-filter">Warehouse: </label>
          <select
            id="warehouse-filter"
            value={selectedWarehouse || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedWarehouse(id);
              setForm({ ...form, warehouseId: id });
              loadItems();
            }}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <form onSubmit={addItem} className="warehouses-form">
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Qty"
          type="number"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          required
        />
        <input
          placeholder="Warehouse ID"
          type="number"
          value={form.warehouseId}
          onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
          required
        />
        <button type="submit">Add Item</button>
      </form>
      <table className="warehouses-table">
        <thead>
          <tr className="table-header-row">
            <th className="cell-padding">ID</th>
            <th className="cell-padding">SKU</th>
            <th className="cell-padding">Name</th>
            <th className="cell-padding">Qty</th>
            <th className="cell-padding">Warehouse ID</th>
            <th className="cell-padding">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="warehouse-row">
              <td className="cell-padding">{i.id}</td>
              <td className="cell-padding">{i.sku}</td>
              <td className="cell-padding">{i.name}</td>
              <td className="cell-padding">{i.quantity}</td>
              <td className="cell-padding">{i.warehouseId}</td>
              <td className="cell-padding">
                <button onClick={() => updateItem(i.id)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemPage;
