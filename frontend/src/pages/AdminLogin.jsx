"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { loginAdmin, RESET } from "../redux/features/authSlice" 
import { Container, Title, PrimaryButton } from "../components/common/Design"
import { toast } from "react-toastify"
import Orb from "../components/reactComponents/Orb/Orb"
import { Home } from "lucide-react"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminId: "", 
  })

  const { email, password, adminId } = formData
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // --- 1. MODIFIED SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password || !adminId) {
      toast.error("Please fill in all fields")
      return
    }

    const userData = { email, password, adminId }
    
    // Dispatch the action and wait for it to complete
    const resultAction = await dispatch(loginAdmin(userData))
    
    // Check if the action was fulfilled (successful)
    if (loginAdmin.fulfilled.match(resultAction)) {
      navigate("/admin");
    }
  }

  useEffect(() => {
    return () => {
      dispatch(RESET());
    };
  }, [dispatch]); 

  return (
    <section className="pt-32 pb-16 bg-gradient-to-tr from-black to-gray-800 relative overflow-hidden h-screen">
      <div className="flex justify-end -mt-24 mr-4 gap-2 relative z-20">
  <Link
    to="/"
    className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
  >
    <Home className="w-5 h-5" />
  </Link>
</div>
      <div className="absolute inset-0 z-0">
        <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
      </div>
      <Container className="relative z-10">
        <div className="max-w-md mx-auto p-8 rounded-lg mt-12">
          <Title level={3} className="text-center mb-4 text-white">Admin Sign In</Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input type="email" id="email" name="email" value={email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your email" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
              <input type="password" id="password" name="password" value={password} onChange={handleInputChange} className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your password" required />
            </div>
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-white mb-2">Admin ID</label>
              <input type="text" id="adminId" name="adminId" value={adminId} onChange={handleInputChange} className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your Admin ID" required />
            </div>
            <PrimaryButton type="submit" className="w-full bg-purple-700" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </PrimaryButton>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Not an admin?{" "}
              <Link to="/login" className="text-green-400 hover:underline">
                Go to user login
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default AdminLogin;