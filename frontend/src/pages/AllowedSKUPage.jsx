import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './warehouse.css';

function AllowedSKUPage() {
  const { API, token } = useContext(AuthContext);
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({ sku: '', description: '' });

  useEffect(() => {
    loadSkus();
  }, []);

  const loadSkus = async () => {
    try {
      const res = await axios.get(`${API}/api/allowedskus`);
      setSkus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const addSku = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/api/allowedskus`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setForm({ sku: '', description: '' });
    loadSkus();
  };

  const deleteSku = async (id) => {
    await axios.delete(`${API}/api/allowedskus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadSkus();
  };

  return (
    <div className="warehouses-container">
      <div className="warehouses-header">
        <h2>Allowed SKUs</h2>
      </div>
      <form onSubmit={addSku} className="warehouses-form">
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <button type="submit">Add</button>
      </form>
      <table className="warehouses-table">
        <thead>
          <tr className="table-header-row">
            <th className="cell-padding">ID</th>
            <th className="cell-padding">SKU</th>
            <th className="cell-padding">Description</th>
            <th className="cell-padding">Actions</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((s) => (
            <tr key={s.id} className="warehouse-row">
              <td className="cell-padding">{s.id}</td>
              <td className="cell-padding">{s.sku}</td>
              <td className="cell-padding">{s.description}</td>
              <td className="cell-padding">
                <button onClick={() => deleteSku(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllowedSKUPage;
