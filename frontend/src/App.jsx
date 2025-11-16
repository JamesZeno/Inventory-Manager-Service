import React, { useState, useContext } from 'react'
import axios from 'axios'
import Topbar from './components/TopBar'
import { AuthContext } from "./context/AuthContext";
import UserRegister from './components/Auth/UserRegister';
import AdminDashboard from "./components/AdminDashboard";

function App(){
  const { API, token, role } = useContext(AuthContext);
  const [items, setItems] = useState([])
  const [form, setForm] = useState({sku:'', name:'', qty:0})
  const [auth, setAuth] = useState({user:'', pwd:'', company:''})
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const services = [
    { id: "hosting", label: "Hosting", href: "#" },
    { id: "storage", label: "Cloud Storage", href: "#" },
    { id: "compute", label: "Compute", href: "#" },
    { id: "ai", label: "AI Services", href: "#" },
  ];

  // useEffect(()=>{ loadItems() }, [token])
  async function loadItems(){
    try{
      const res = await axios.get(`${API}/api/items`)
      setItems(res.data)
    }catch(e){
      console.error(e)
    }
  }

  async function addItem(e){
    e.preventDefault()
    await axios.post(`${API}/api/items`, { sku: form.sku, name: form.name, quantity: Number(form.qty) }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setForm({sku:'', name:'', qty:0})
    loadItems()
  }

  return (
    <div>
      <Topbar
        services={services}
        onAdminPanelClick={() => setShowAdminPanel(!showAdminPanel)}
      />
      <div style={{paddingTop:56, width:1750}}></div>

      {showAdminPanel && role === "Admin" && (
        <AdminDashboard></AdminDashboard>
      )}
      <section style={{marginBottom:20}}>
        <h3>Auth</h3>
        <UserRegister></UserRegister>
        <div>Token: {token ? token.slice(0,40) + '...' : 'none'}</div>
      </section>

      <section>
        <h3>Items</h3>
        <form onSubmit={addItem}>
          <input placeholder="sku" value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} required />
          <input placeholder="name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
          <input placeholder="qty" type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} required />
          <button>Add (auth required)</button>
        </form>
        <ul>
          {items.map(it => <li key={it.id}>{it.sku} — {it.name} ({it.quantity ?? it.qty})</li>)}
        </ul>
      </section>
    </div>
  )
}

export default App