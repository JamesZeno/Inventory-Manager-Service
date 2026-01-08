import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './warehouse.css';
import AllowedSKUFormModal from '../components/AllowedSKUFormModal';

function AllowedSKUPage() {
  const { API, token } = useContext(AuthContext);
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({ id: null, sku: '', description: '' });
  const [formOpen, setFormOpen] = useState(false);

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

  const openCreate = () => {
    setForm({ id: null, sku: '', description: '' });
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setForm({ id: s.id, sku: s.sku, description: s.description });
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { sku: form.sku, description: form.description };
      if (form.id) {
        await axios.put(`${API}/api/allowedskus/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/api/allowedskus`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormOpen(false);
      loadSkus();
    } catch (err) {
      console.error('save sku', err);
      alert(err?.response?.data || err.message);
    }
  };

  const deleteSku = async (id) => {
    if (!confirm('Delete this SKU?')) return;
    try {
      await axios.delete(`${API}/api/allowedskus/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadSkus();
    } catch (e) {
      console.error('delete', e);
      alert('Delete failed');
    }
  };

  return (
    <div className="warehouses-container">
      <div className="warehouses-header">
        <h2>Allowed SKUs</h2>
        <button className="btn-primary" onClick={openCreate}>
          New SKU
        </button>
      </div>
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
                <button onClick={() => openEdit(s)}>Edit</button>
                <button onClick={() => deleteSku(s.id)}>Delete</button>
              </td>
            </tr>
          ))
        }
      </tbody>
      </table>
      <AllowedSKUFormModal
        form={form}
        setForm={setForm}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}

export default AllowedSKUPage;
