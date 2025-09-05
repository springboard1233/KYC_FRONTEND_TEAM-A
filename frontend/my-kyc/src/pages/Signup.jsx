import { useState } from 'react'
import api from '../api/axios'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null); setMsg(null)
    try {
      const res = await api.post('/api/signup', { name, email, password })
      setMsg(res.data.message || 'Signup successful')
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Signup</h2>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" required />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full border rounded px-3 py-2" required />
        <button className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700">Create account</button>
        {msg && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2">{msg}</div>}
        {err && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
      </form>
    </div>
  )
}
