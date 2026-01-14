import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './warehouse.css';
import ItemFormModal from '../components/ItemFormModal';

function ItemPage() {
  const { API, token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [form, setForm] = useState({ id: null, sku: '', qty: 0, warehouseId: 1 });
  const [formOpen, setFormOpen] = useState(false);

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
        setForm(f => ({ ...f, warehouseId: res.data[0].id }));
      }
    } catch (e) {
      console.error('loadWarehouses', e);
    }
  };

  const loadItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const openCreate = () => {
    setForm({ id: null, sku: '', qty: 0, warehouseId: selectedWarehouse });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setForm({ id: item.id, sku: item.sku, qty: item.quantity, warehouseId: item.warehouseId });
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { sku: form.sku, quantity: Number(form.qty), warehouseId: Number(form.warehouseId) };
      if (form.id) {
        await axios.put(`${API}/api/items/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/api/items`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormOpen(false);
      loadItems();
    } catch (err) {
      console.error('save item', err);
      alert(err?.response?.data || err.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
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
              setForm(f => ({ ...f, warehouseId: id }));
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
        <div>
          <button className="btn-primary" onClick={openCreate}>New Item</button>
        </div>
      </div>

      <table className="warehouses-table">
        <thead>
          <tr className="table-header-row">
            <th className="cell-padding">ID</th>
            <th className="cell-padding">SKU</th>
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
              <td className="cell-padding">{i.quantity}</td>
              <td className="cell-padding">{i.warehouseId}</td>
              <td className="cell-padding">
                <button onClick={() => openEdit(i)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ItemFormModal
        form={form}
        setForm={setForm}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}

export default ItemPage;
