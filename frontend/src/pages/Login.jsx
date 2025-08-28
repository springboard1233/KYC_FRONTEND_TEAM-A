"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { login, RESET } from "../redux/features/authSlice"
import { Container, Title, PrimaryButton, commonClassNameOfInput } from "../components/common/Design"
import { toast } from "react-toastify"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { email, password } = formData
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading, isLoggedIn, isSuccess } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    const userData = { email, password }
    dispatch(login(userData))
  }

useEffect(() => {
  console.log("useEffect triggered with isSuccess:", isSuccess, "and user:", user);
  if (isSuccess && user) {

    navigate("/doc-uploader");  

}

  return () => {
    dispatch(RESET());
  };
}, [user, isSuccess, dispatch, navigate]);


  return (
    <section className="pt-32 pb-16">
      <Container>
        <div className="max-w-md mx-auto p-8 rounded-lg shadow-s1 bg-gray-200 border border-gray-700">
          <Title level={3} className="text-center mb-8">
            Sign In
          </Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className={commonClassNameOfInput}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                className={commonClassNameOfInput}
                placeholder="Enter your password"
                required
              />
            </div>

            <PrimaryButton type="submit" className="w-full bg-purple-700" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </PrimaryButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-green hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}


export default Login