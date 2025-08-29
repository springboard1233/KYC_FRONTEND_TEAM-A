"use client"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { register, RESET } from "../redux/features/authSlice"
import { Container, Title, PrimaryButton, commonClassNameOfInput } from "../components/common/Design"
import { toast } from "react-toastify"
import Prismatic from "../components/reactComponents/Prismatic/Prismatic"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const { name, email, password, confirmPassword } = formData
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading, isLoggedIn, isSuccess } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast.error("Please fill in all fields")
      console.log("handleSubmit function was called!");
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    const userData = { name, email, password }
    dispatch(register(userData))
  }


useEffect(() => {
  if (isSuccess && user) {
    navigate("/doc-uploader");
  }

  return () => {
    dispatch(RESET());
  };
}, [user, isSuccess, dispatch, navigate]);

  return (
    <section className="relative pt-18 pb-16 bg-black">
    {/* Background Layer */}
    <div className="absolute inset-0 z-0">
      <Prismatic
        animationType="rotate3d"
        intensity={2}
        speed={0.5}
        distort={1.0}
        paused={false}
        offset={{ x: 0, y: 0 }}
        hoverDampness={0.25}
        rayCount={24}
        mixBlendMode="lighten"
        colors={['#ff007a', '#4d3dff', '#ffffff']}
      />
    </div>

  {/* Foreground Content */}
  <Container className="relative z-10">
    <div className="max-w-md mx-auto bg-gray-800/70 border border-gray-600 p-8 rounded-lg shadow-s1 backdrop-blur-sm text-white">
      <Title level={3} className="text-center mb-8 text-white">
        Create Account
      </Title>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleInputChange}
            className={`${commonClassNameOfInput} bg-gray-900/50 text-white placeholder-gray-400`}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className={`${commonClassNameOfInput} bg-gray-900/50 text-white placeholder-gray-400`}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
            className={`${commonClassNameOfInput} bg-gray-900/50 text-white placeholder-gray-400`}
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange}
            className={`${commonClassNameOfInput} bg-gray-900/50 text-white placeholder-gray-400`}
            placeholder="Confirm your password"
            required
          />
        </div>

        <PrimaryButton type="submit" className="w-full bg-purple-700" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </PrimaryButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </Container>
</section>
  )
}

export default Register;
