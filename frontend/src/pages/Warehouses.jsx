import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

function WarehousesPage(){
  const { API, token } = useContext(AuthContext)
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ id: null, name: '', location: '', companyId: '' })

  useEffect(()=>{ loadWarehouses() }, [])

  async function loadWarehouses(){
    setLoading(true)
    try{
      const res = await axios.get(`${API}/api/warehouses`)
      setWarehouses(res.data)
    }catch(e){
      console.error('loadWarehouses', e)
    }finally{ setLoading(false) }
  }

  function openCreate(){
    setForm({ id: null, name: '', location: '', companyId: '' })
    setFormOpen(true)
  }

  function openEdit(w){
    setForm({ id: w.id, name: w.name ?? '', location: w.location ?? '', companyId: w.companyId ?? '' })
    setFormOpen(true)
  }

  async function submit(e){
    e.preventDefault()
    try{
      const payload = { Name: form.name, Location: form.location }
      // include CompanyId if provided
      if (form.companyId !== '' && form.companyId !== null) payload.CompanyId = Number(form.companyId)
      if (form.id){
        await axios.put(`${API}/api/warehouses/${form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      } else {
        await axios.post(`${API}/api/warehouses`, payload, { headers: { Authorization: `Bearer ${token}` } })
      }
      setFormOpen(false)
      loadWarehouses()
    }catch(err){
      console.error('save warehouse', err)
      alert(err?.response?.data || err.message)
    }
  }

  async function remove(id){
    if (!confirm('Delete this warehouse?')) return
    try{
      await axios.delete(`${API}/api/warehouses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      loadWarehouses()
    }catch(e){ console.error('delete', e); alert('Delete failed') }
  }

  return (
    <div style={{maxWidth:1100, margin:'96px auto 32px', padding:36}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2>Warehouses</h2>
        <div>
          <button className="btn-primary" onClick={openCreate}>New Warehouse</button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left', borderBottom:'1px solid var(--line)'}}>
              <th style={{padding:'8px'}}>ID</th>
              <th style={{padding:'8px'}}>Name</th>
              <th style={{padding:'8px'}}>Location</th>
              <th style={{padding:'8px'}}>CompanyId</th>
              <th style={{padding:'8px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(w => (
              <tr key={w.id} style={{borderBottom:'1px solid var(--line)'}}>
                <td style={{padding:8}}>{w.id}</td>
                <td style={{padding:8}}>{w.name}</td>
                <td style={{padding:8}}>{w.location}</td>
                <td style={{padding:8}}>{w.companyId ?? ''}</td>
                <td style={{padding:8}}>
                  <button onClick={()=>openEdit(w)} style={{marginRight:8}}>Edit</button>
                  <button onClick={()=>remove(w.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formOpen && (
        <div style={{marginTop:18, padding:12, borderRadius:8, background:'var(--panel-bg)', boxShadow:'var(--shadow)'}}>
          <h3>{form.id ? 'Edit' : 'Create'} Warehouse</h3>
          <form onSubmit={submit} style={{display:'grid', gap:8}}>
            <input placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
            <input placeholder="Location" value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} />
            <input placeholder="CompanyId (numeric)" type="number" value={form.companyId} onChange={e=>setForm(f=>({...f, companyId:e.target.value}))} />
            <div style={{display:'flex', gap:8}}>
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={()=>setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default WarehousesPage
