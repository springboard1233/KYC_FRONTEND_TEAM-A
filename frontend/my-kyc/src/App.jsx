import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import api from './api/axios'
import { useState } from 'react'

function Me() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const call = async () => {
    setErr(null); setData(null)
    try {
      const res = await api.get('/api/me')
      setData(res.data)
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }
  return (
    <div className="p-6 space-y-3">
      <button onClick={call} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Call /api/me</button>
      <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">{data ? JSON.stringify(data, null, 2) : (err || 'No data')}</pre>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-white border-b flex gap-4">
        <Link to="/signup" className="text-indigo-700">Signup</Link>
        <Link to="/login" className="text-indigo-700">Login</Link>
        <Link to="/me" className="text-indigo-700">Me</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<Me />} />
      </Routes>
    </BrowserRouter>
  )
}
