import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    const userData = localStorage.getItem(username);
    if (!userData) {
      alert("User not found, please sign up.");
      return;
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
      alert("Invalid password");
      return;
    }

    alert("Login successful!");
    navigate("/home");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="https://media.istockphoto.com/id/2043823329/photo/internet-network-cybersecurity-concept-data-privacy-protection-from-malicious-attacks-digital.jpg?s=612x612&w=0&k=20&c=EdSpTwVaTVMvZUUHk4d13L1VJsb2PxnPxRPrlmtIxOw="
          alt="Login Illustration"
        />
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>

          <div className="form-group">
            <label>Work Email Address*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Keep me logged in
            </label>
            <span
              className="forgot"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="login-btn">
            LOG IN
          </button>

          <p className="signup-text">
            Don’t have an account?{" "}
            <span className="signup-link" onClick={() => navigate("/signup")}>
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
