import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [page, setPage] = useState('auth')
  const [authTab, setAuthTab] = useState('login')
  const [activeTab, setActiveTab] = useState('aadhaar')
  const [aadhaar, setAadhaar] = useState(null)
  const [pan, setPan] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  const showToast = (t) => {
    setToast(t)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const payload = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    }
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(data.message || 'User registered successfully!')
        setPage('home')
      } else if (res.status === 400) {
        showToast('Username already exists')
      } else {
        showToast(data.message || 'Signup failed')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const payload = {
      username: e.target.username.value,
      password: e.target.password.value,
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.message === 'Login successful') {
        showToast('Login successful')
        setPage('home')
      } else if (res.status === 401 || data.message === 'Wrong username or password') {
        showToast('Wrong username or password')
      } else {
        showToast(data.message || 'Login failed')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleExtractAadhaar = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setAadhaar(data)
        showToast('Aadhaar extracted successfully')
      } else {
        showToast('Aadhaar extraction failed')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleSaveAadhaar = async () => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aadhaar),
      })
      const data = await res.json()
      if (res.ok) showToast(data.message || 'Aadhaar details saved successfully!')
      else showToast('Failed to save Aadhaar')
    } catch {
      showToast('Network error')
    }
  }

  const handleExtractPan = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/extract_pan', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setPan(data)
        showToast('PAN extracted successfully')
      } else {
        showToast('PAN extraction failed')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleSavePan = async () => {
    try {
      const res = await fetch('/api/save_pan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pan),
      })
      const data = await res.json()
      if (res.ok) showToast(data.message || 'PAN details saved successfully!')
      else showToast('Failed to save PAN')
    } catch {
      showToast('Network error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <header className="flex justify-between p-6">
        <h1 className="text-xl font-bold">KYC Studio</h1>
        <div className="flex gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-3 py-1 rounded bg-gray-700">
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          {page === 'home' && (
            <button onClick={() => setPage('auth')} className="px-3 py-1 rounded bg-red-600">Logout</button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {page === 'auth' ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-gray-800 p-8 rounded-xl w-96">
              <div className="flex gap-3 mb-6">
                <button onClick={() => setAuthTab('login')} className={authTab === 'login' ? 'bg-white text-black px-4 py-2 rounded' : 'px-4 py-2 rounded bg-gray-700'}>Login</button>
                <button onClick={() => setAuthTab('signup')} className={authTab === 'signup' ? 'bg-white text-black px-4 py-2 rounded' : 'px-4 py-2 rounded bg-gray-700'}>Signup</button>
              </div>
              {authTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3">
                  <input name="username" placeholder="Username" className="w-full p-2 rounded bg-gray-900" />
                  <input name="password" type="password" placeholder="Password" className="w-full p-2 rounded bg-gray-900" />
                  <button className="w-full bg-blue-500 py-2 rounded text-black">Login</button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3">
                  <input name="username" placeholder="Username" className="w-full p-2 rounded bg-gray-900" />
                  <input name="email" type="email" placeholder="Email" className="w-full p-2 rounded bg-gray-900" />
                  <input name="password" type="password" placeholder="Password" className="w-full p-2 rounded bg-gray-900" />
                  <button className="w-full bg-blue-500 py-2 rounded text-black">Signup</button>
                </form>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto p-6">
            <div className="flex gap-4 mb-6">
              <button onClick={() => setActiveTab('aadhaar')} className={activeTab === 'aadhaar' ? 'bg-white text-black px-4 py-2 rounded' : 'px-4 py-2 rounded bg-gray-700'}>Aadhaar</button>
              <button onClick={() => setActiveTab('pan')} className={activeTab === 'pan' ? 'bg-white text-black px-4 py-2 rounded' : 'px-4 py-2 rounded bg-gray-700'}>PAN</button>
            </div>

            {activeTab === 'aadhaar' ? (
              <div className="space-y-4">
                <input type="file" onChange={(e) => handleExtractAadhaar(e.target.files[0])} className="block w-full" />
                {aadhaar && (
                  <div className="p-4 bg-gray-800 rounded">
                    <p><b>Name:</b> {aadhaar.Name}</p>
                    <p><b>DOB:</b> {aadhaar.DOB}</p>
                    <p><b>Aadhaar Number:</b> {aadhaar.AadhaarNumber}</p>
                    <p><b>Gender:</b> {aadhaar.Gender}</p>
                    <p><b>Address:</b> {aadhaar.Address}</p>
                  </div>
                )}
                <button onClick={handleSaveAadhaar} className="bg-blue-500 text-black px-4 py-2 rounded">Save Aadhaar</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="file" onChange={(e) => handleExtractPan(e.target.files[0])} className="block w-full" />
                {pan && (
                  <div className="p-4 bg-gray-800 rounded">
                    <p><b>Name:</b> {pan.Name}</p>
                    <p><b>Father:</b> {pan.FatherName}</p>
                    <p><b>PAN Number:</b> {pan.PANNumber}</p>
                  </div>
                )}
                <button onClick={handleSavePan} className="bg-blue-500 text-black px-4 py-2 rounded">Save PAN</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">
          {toast}
        </motion.div>
      )}
    </div>
  )
}
