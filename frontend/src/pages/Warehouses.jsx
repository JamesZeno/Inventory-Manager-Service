import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import WarehouseTableRow from '../components/WarehouseTableRow'
import WarehouseFormModal from '../components/WarehouseFormModal'
import './warehouse.css'

function WarehousesPage() {
  const { API, token } = useContext(AuthContext)
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', location: '' })

  useEffect(() => { loadWarehouses() }, [])

  async function loadWarehouses() {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/warehouses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(res.data);
    } catch (e) {
      console.error('loadWarehouses', e);
    } finally { setLoading(false) }
  }

  function openCreate() {
    setForm({ id: null, name: '', location: '' })
    setFormOpen(true)
  }

  function openEdit(w) {
    setForm({ id: w.id, name: w.name ?? '', location: w.location ?? '' })
    setFormOpen(true)
  }

  async function submit(e) {
    e.preventDefault()
    try {
      const payload = { Name: form.name, Location: form.location }
      if (form.id) {
        await axios.put(`${API}/api/warehouses/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API}/api/warehouses`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setFormOpen(false)
      loadWarehouses()
    } catch (err) {
      console.error('save warehouse', err)
      alert(err?.response?.data || err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this warehouse?')) return
    try {
      await axios.delete(`${API}/api/warehouses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      loadWarehouses()
    } catch (e) { console.error('delete', e); alert('Delete failed') }
  }

  return (
    <div className="warehouses-container">
      <div className="warehouses-header">
        <h2>Warehouses</h2>
        <div>
          <button className="btn-primary" onClick={openCreate}>
            New Warehouse
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="warehouses-table">
          <thead>
            <tr className="table-header-row">
              <th className="cell-padding">ID</th>
              <th className="cell-padding">Name</th>
              <th className="cell-padding">Location</th>
              <th className="cell-padding">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(w => (
              <WarehouseTableRow
                key={w.id}
                warehouse={w}
                onEdit={openEdit}
                onDelete={remove}
              />
            ))}
          </tbody>
        </table>
      )}

      <WarehouseFormModal
        form={form}
        setForm={setForm}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />
    </div>
  )
}

export default WarehousesPage
