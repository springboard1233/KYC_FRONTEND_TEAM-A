"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
// We will create loginAdmin in the next step
import { loginAdmin, RESET } from "../redux/features/authSlice" 
import { Container, Title, PrimaryButton } from "../components/common/Design"
import { toast } from "react-toastify"
import Orb from "../components/reactComponents/Orb/Orb"

const AdminLogin = () => {
  // 1. Add adminId to the component's state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminId: "", 
  })

  const { email, password, adminId } = formData // Destructure adminId
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading, isSuccess } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password || !adminId) { // Check for adminId
      toast.error("Please fill in all fields")
      return
    }

    // 3. Include adminId in the data sent on submit
    const userData = { email, password, adminId } 
    dispatch(loginAdmin(userData)) 
  }

  useEffect(() => {
    if (isSuccess && user) {
      navigate("/admin");  
    }
    return () => {
      dispatch(RESET());
    };
  }, [user, isSuccess, dispatch, navigate]);

  return (
    <section className="pt-32 pb-16 bg-gradient-to-tr from-black to-gray-800 relative overflow-hidden h-screen">
      <div className="absolute inset-0 z-0">
        <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
      </div>
      <Container className="relative z-10">
        <div className="max-w-md mx-auto p-8 rounded-lg">
          <Title level={3} className="text-center mb-8 text-white">
            Admin Sign In
          </Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input type="email" id="email" name="email" value={email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your email" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
              <input type="password" id="password" name="password" value={password} onChange={handleInputChange} className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your password" required />
            </div>
            
            {/* 2. Add the new input field for Admin ID in the form */}
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