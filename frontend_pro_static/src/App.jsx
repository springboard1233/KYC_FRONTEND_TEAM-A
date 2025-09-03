import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sampleAadhaar = {
  Name: 'Hredhaan Naik',
  DOB: '03-09-1981',
  AadhaarNumber: 'XXXX-XXXX-XXXX',
  Gender: 'Male',
  Address: '29/592, Nagarajan Road, Ramagundam 879104'
}

const samplePan = {
  Name: 'Hredhaan Naik',
  FatherName: 'Parent Name',
  PANNumber: 'ABCDE1234F'
}

// small UI primitives with premium styling
const IconButton = ({ children, onClick }) => (
  <button onClick={onClick} className="header-btn px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/6 text-sm">
    {children}
  </button>
)

const Field = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/3">
    <div className="text-xs opacity-70">{label}</div>
    <div className="font-semibold text-sm text-right">{value}</div>
  </div>
)

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [page, setPage] = useState('auth') // 'auth' or 'home'
  const [authTab, setAuthTab] = useState('login') // login/signup
  const [activeTab, setActiveTab] = useState('aadhaar') // aadhaar/pan
  const [aadhaar, setAadhaar] = useState(null)
  const [pan, setPan] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (t) => { setToast(t); setTimeout(()=> setToast(null), 1800) }

  const handleDummyAuth = (type) => {
    showToast(type === 'login' ? 'Login successful' : 'Signup successful')
    setTimeout(()=> setPage('home'), 600)
  }

  const handleExtract = (type) => {
    // simulate extraction with sample data and small animation
    if (type === 'aadhaar') {
      setTimeout(()=> { setAadhaar(sampleAadhaar); showToast('Aadhaar extracted') }, 500)
    } else {
      setTimeout(()=> { setPan(samplePan); showToast('PAN extracted') }, 500)
    }
  }

  const handleSave = (type) => {
    showToast(type === 'aadhaar' ? 'Aadhaar saved!' : 'PAN saved!')
    // keep data in memory only for demo
  }

  return (
    <div className={theme==='dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-b from-[#05050a] via-[#070717] to-[#04040a] text-white">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffffff18] to-[#ffffff06] ring-1 ring-white/6 card-hero"></div>
              <div>
                <div className="text-sm opacity-70">Premium Dashboard</div>
                <div className="text-xl font-bold">KYC Studio</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconButton onClick={() => setTheme(theme==='dark'?'light':'dark')}>{theme==='dark' ? 'Light' : 'Dark'} Mode</IconButton>
              <IconButton onClick={() => setPage('auth')}>Logout</IconButton>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {page === 'auth' ? (
              <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-full max-w-3xl grid grid-cols-2 gap-6">
                    <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-8 rounded-3xl bg-gradient-to-br from-[#0b0b0f] to-[#0b0b0f] bg-frost">
                      <h3 className="text-2xl font-bold mb-4">Welcome back</h3>
                      <p className="opacity-70 mb-6">Sign in to manage KYC documents — pro UI demo</p>
                      <div className="flex gap-3 mb-6">
                        <button onClick={()=> setAuthTab('login')} className={authTab==='login' ? 'px-4 py-2 rounded-xl bg-brand-500 text-black font-semibold' : 'px-4 py-2 rounded-xl bg-white/6'}>Login</button>
                        <button onClick={()=> setAuthTab('signup')} className={authTab==='signup' ? 'px-4 py-2 rounded-xl bg-brand-500 text-black font-semibold' : 'px-4 py-2 rounded-xl bg-white/6'}>Signup</button>
                      </div>
                      <motion.form onSubmit={(e)=> { e.preventDefault(); handleDummyAuth(authTab) }} initial={{}} animate={{}} className="space-y-4">
                        <input placeholder="Username" className="w-full p-3 rounded-xl bg-black/40 border border-white/8" required/>
                        {authTab==='signup' && <input placeholder="Email" className="w-full p-3 rounded-xl bg-black/40 border border-white/8" type="email" required/>}
                        <input placeholder="Password" type="password" className="w-full p-3 rounded-xl bg-black/40 border border-white/8" required/>
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6b6fff] to-[#a26bff] text-black font-semibold">{authTab==='login'?'Login':'Create account'}</button>
                      </motion.form>
                    </motion.div>
                    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-8 rounded-3xl bg-gradient-to-br from-[#0b0b0f] to-[#0b0b0f] bg-frost">
                      <h3 className="text-2xl font-bold mb-4">Why KYC Studio?</h3>
                      <ul className="list-disc pl-5 opacity-80 space-y-2">
                        <li>Polished UI for mentor demos</li>
                        <li>Animated interactions & pro styling</li>
                        <li>Ready to integrate with backend later</li>
                      </ul>
                      <div className="mt-6">
                        <div className="text-sm opacity-70 mb-2">Quick preview</div>
                        <div className="rounded-xl overflow-hidden border border-white/6">
                          <div className="p-4 bg-gradient-to-br from-[#0f1220] to-[#0b0b10]">
                            <div className="text-sm opacity-70">Aadhaar</div>
                            <div className="font-semibold">{sampleAadhaar.Name}</div>
                            <div className="text-xs opacity-70">{sampleAadhaar.AadhaarNumber}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="space-y-6">
                  <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0b0b0f] to-[#09090b] bg-frost">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-3 items-center">
                        <button onClick={()=> setActiveTab('aadhaar')} className={activeTab==='aadhaar' ? 'px-4 py-2 rounded-xl bg-white text-black font-semibold' : 'px-4 py-2 rounded-xl bg-white/6'}>Aadhaar</button>
                        <button onClick={()=> setActiveTab('pan')} className={activeTab==='pan' ? 'px-4 py-2 rounded-xl bg-white text-black font-semibold' : 'px-4 py-2 rounded-xl bg-white/6'}>PAN</button>
                      </div>
                      <div className="opacity-70 text-sm">Pro UI • Demo mode</div>
                    </div>

                    {activeTab==='aadhaar' ? (
                      <motion.div key='aadhaar' initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="grid md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-2">
                          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0f1220] to-[#0b0b10] border border-white/6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-sm opacity-70">Upload Aadhaar</div>
                                <div className="text-lg font-semibold">Extract fields automatically</div>
                              </div>
                              <div className="text-sm opacity-60">Drag & drop or choose file</div>
                            </div>
                            <div className="flex gap-4 items-center">
                              <input type='file' onChange={()=> handleExtract('aadhaar')} className='hidden' id='aadhaarFile'/>
                              <label htmlFor='aadhaarFile' className='cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-[#6b6fff] to-[#a26bff] text-black font-semibold'>Choose file</label>
                              <button onClick={()=> handleExtract('aadhaar')} className='px-4 py-2 rounded-xl bg-white/8'>Simulate Extract</button>
                              <button onClick={()=> handleSave('aadhaar')} className='px-4 py-2 rounded-xl bg-white text-black'>Save</button>
                            </div>
                            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                              {aadhaar ? (
                                Object.entries(aadhaar).map(([k,v]) => <Field key={k} label={k} value={v} />)
                              ) : (
                                <div className='col-span-2 p-6 rounded-lg bg-white/3 opacity-70'>No extracted data yet — click <b>Simulate Extract</b>.</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='rounded-2xl p-6 bg-gradient-to-br from-[#0f1220] to-[#0b0b10] border border-white/6'>
                            <div className='text-sm opacity-70 mb-2'>Preview</div>
                            <div className='p-3 rounded-lg bg-white/4'>
                              <div className='text-sm opacity-70'>Name</div>
                              <div className='font-semibold'>{aadhaar?.Name || '—'}</div>
                              <div className='mt-3 text-xs opacity-70'>This preview shows the most important fields for quick confirmation.</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key='pan' initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className='grid md:grid-cols-3 gap-6 items-start'>
                        <div className='md:col-span-2'>
                          <div className='rounded-2xl p-6 bg-gradient-to-br from-[#0f1220] to-[#0b0b10] border border-white/6'>
                            <div className='flex items-center justify-between mb-4'>
                              <div>
                                <div className='text-sm opacity-70'>Upload PAN</div>
                                <div className='text-lg font-semibold'>Extract PAN fields</div>
                              </div>
                              <div className='text-sm opacity-60'>PDF or image accepted</div>
                            </div>
                            <div className='flex gap-4 items-center'>
                              <input type='file' onChange={()=> handleExtract('pan')} className='hidden' id='panFile'/>
                              <label htmlFor='panFile' className='cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-[#6b6fff] to-[#a26bff] text-black font-semibold'>Choose file</label>
                              <button onClick={()=> handleExtract('pan')} className='px-4 py-2 rounded-xl bg-white/8'>Simulate Extract</button>
                              <button onClick={()=> handleSave('pan')} className='px-4 py-2 rounded-xl bg-white text-black'>Save</button>
                            </div>
                            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                              {pan ? (
                                Object.entries(pan).map(([k,v]) => <Field key={k} label={k} value={v} />)
                              ) : (
                                <div className='col-span-2 p-6 rounded-lg bg-white/3 opacity-70'>No extracted data yet — click <b>Simulate Extract</b>.</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='rounded-2xl p-6 bg-gradient-to-br from-[#0f1220] to-[#0b0b10] border border-white/6'>
                            <div className='text-sm opacity-70 mb-2'>Preview</div>
                            <div className='p-3 rounded-lg bg-white/4'>
                              <div className='text-sm opacity-70'>Name</div>
                              <div className='font-semibold'>{pan?.Name || '—'}</div>
                              <div className='mt-3 text-xs opacity-70'>Quick confirmation before saving.</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className='mt-6 rounded-2xl p-6 bg-gradient-to-br from-[#08080a] to-[#05050a] border border-white/6'>
                    <div className='text-sm opacity-70'>Tips</div>
                    <div className='mt-2 opacity-80'>This is a static demo. When connected to a real backend, replace the simulate buttons with real API calls.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {toast && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className='fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30'>
              {toast}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
