import React, { useState, useContext } from 'react'
import axios from 'axios'
import Topbar from './components/TopBar'
import { AuthContext } from "./context/AuthContext";
import AdminDashboard from "./components/AdminDashboard";
import AllowedSKUPage from "./pages/AllowedSKUPage";
import ItemPage from "./pages/ItemPage";
import WarehousesPage from './pages/Warehouses'
import welcomeImg from './assets/welcome-img.png'
import './app.css'

function App(){
  const { API, token, role } = useContext(AuthContext);
  const [items, setItems] = useState([])
  const [form, setForm] = useState({sku:'', name:'', qty:0})
  const [auth, setAuth] = useState({user:'', pwd:'', company:''})
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const services = [
    { id: "warehouses", label: "Warehouses", href: "/warehouses" },
    { id: "allowedskus", label: "Allowed SKUs", href: "/allowedskus" },
    { id: "items", label: "Items", href: "/items" },
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
      <div className='topbuffer'>
        
      </div>

      {/* route by pathname so TopBar remains shared across pages */}
      {window.location.pathname.startsWith('/warehouses') ? (
        <WarehousesPage />
      ) : window.location.pathname.startsWith('/allowedskus') ? (
        <AllowedSKUPage />
      ) : window.location.pathname.startsWith('/items') ? (
        <ItemPage />
      ) : showAdminPanel && role === "Admin" ? (
        <AdminDashboard></AdminDashboard>
      ) : (
        // Homepage Hero
        <div className="hero">
          <div className="hero__left">
            <h1>INVENTORY SYSTEM</h1>
            <p>Welcome to the Inventory System</p>
            <button className="btn-primary">Get Started</button>
          </div>
          <div className="hero__card">
            <img src={welcomeImg} alt="Welcome" className="welcome-img" />
          </div>
        </div>
      )}
    </div>
  )
}

export default App