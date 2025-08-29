// src/pages/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    userType: "individual",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "India",
    agree: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.agree) {
      alert("You must agree to the Terms & Privacy Policy");
      return;
    }

    if (!form.email || !form.password) {
      alert("Email and Password are required!");
      return;
    }

    // ✅ Store users properly in localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((u) => u.email === form.email);

    if (exists) {
      alert("User already exists with this email! Please login.");
      navigate("/login");
      return;
    }

    users.push(form);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! Please login.");
    console.log("✅ User saved:", form);

    // ✅ Redirect to login page
    navigate("/login");
  };

  return (
    <div className="signup-container">
      {/* Left side image */}
     <div className="signup-left">
  <img 
    src="https://img.freepik.com/free-photo/sign-up-form-button-graphic-concept_53876-101286.jpg" 
    alt="Signup" 
  />
</div>


      {/* Right side form */}
      <div className="signup-right">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="userType"
                value="individual"
                checked={form.userType === "individual"}
                onChange={handleChange}
              />
              Individual
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="agency"
                checked={form.userType === "agency"}
                onChange={handleChange}
              />
              Agency
            </label>
          </div>

          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Work Email Address*"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="phone"
              placeholder="+91"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              required
            >
              <option>India</option>
              <option>USA</option>
              <option>UK</option>
              <option>Canada</option>
            </select>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <span>
              Yes, I understand and agree to the{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </span>
          </div>

          <button type="submit" className="signup-btn">
            CREATE MY ACCOUNT
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
