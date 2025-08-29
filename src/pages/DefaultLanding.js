import React from "react";
import { useNavigate } from "react-router-dom";

export default function DefaultLanding() {
  const navigate = useNavigate();

  const leftImages = [
    "https://cdn.hyperverge.co/wp-content/uploads/2022/08/What-is-Biometric-Verification_.webp",
    "https://images.ctfassets.net/23aumh6u8s0i/6MQMwDdaUKU1w1uTWkkRZc/faca51a20b078f6bdb75b73502a92b15/cybersecurity_finger",
    "https://councils.forbes.com/hubfs/biometric-authentication-enhancing-security-without-compromising-privacy.jpg"
  ];

  const rightImages = [
    "https://cdn.prod.website-files.com/65aa88196fa61dfde861d520/65afb3793414fdde3ffccd46_The%20Mechanics%20of%20AI%20in%20Identity%20Verification.png",
    "https://unblast.com/wp-content/uploads/2021/08/Face-Recognition-Illustration.jpg",
    "https://img.freepik.com/premium-photo/3d-face-recognition-illustration-concept-facial-recognition-face-id-system-biometric-identification-face-scan-system-cyber-security-concept-modern-vector-3d-style_839035-1807313.jpg"
  ];

  return (
    <div style={{
      background: "#232223",
      minHeight: "100vh",
      fontFamily: "Montserrat, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "30px 60px 12px 60px",
        background: "#171718"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img
            src="https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/556046b2-df73-4617-b737-089f0f698bba.png"
            alt="KYCShield Logo"
            style={{
              width: 50,
              height: 50,
              objectFit: "contain",
              background: "transparent",
              borderRadius: "14px",
              boxShadow: "0 0 30px rgba(52,64,128,0.13)",
              border: "2px solid #232223"
            }}
          />
          <span style={{
            fontWeight: 700,
            fontSize: 28,
            color: "white",
            letterSpacing: 2
          }}>
            KYCShield
          </span>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: "#FFC436",
              border: "none",
              color: "#232223",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 5,
              padding: "10px 25px",
              cursor: "pointer"
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "transparent",
              border: "2px solid #FFC436",
              color: "#FFC436",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 5,
              padding: "10px 23px",
              cursor: "pointer"
            }}
          >
            Log In
          </button>
        </div>
      </header>
      
      {/* Hero Section */}
      <section style={{
        background: "black",
        color: "white",
        borderRadius: 32,
        margin: "32px auto 0 auto",
        maxWidth: 1300,
        minHeight: 600,
        position: "relative",
        boxShadow: "0 6px 40px rgba(30,30,30,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0"
      }}>
        {/* Left Images */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 450,
          marginRight: 45
        }}>
          {leftImages.map((src, idx) => (
            <img
              key={"left" + idx}
              src={src}
              alt=""
              style={{
                width: 155,
                height: 155,
                objectFit: "cover",
                borderRadius: 18,
                border: "3px solid #FFC436",
                marginBottom: idx < 2 ? 15 : 0
              }}
            />
          ))}
        </div>

        {/* Center Content */}
        <div style={{
          textAlign: "center",
          minWidth: 400,
          flex: "1 1 auto"
        }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1.13, color: "#344080" }}>
            Secure & Smart KYC Verification
          </h1>
          <h2 style={{ color: "#FFC436", fontSize: 32, marginTop: 30, fontWeight: 600, letterSpacing: 1 }}>
            AI-Powered Identity Authentication
          </h2>
          <p style={{
            fontSize: 18,
            color: "#E0E0E0",
            marginTop: 20,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.6
          }}>
            Protect your platform from fraud with our advanced biometric & document verification.
            Fast, reliable, and privacy-focused KYC solution to onboard users with confidence.
          </p>
          <button 
            onClick={() => navigate("/login")} // <-- Added navigation
            style={{
              marginTop: 38,
              fontSize: 22,
              padding: "16px 45px",
              background: "#FFC436",
              border: "none",
              borderRadius: 7,
              fontWeight: 700,
              color: "#222223",
              cursor: "pointer"
            }}
          >
            START VERIFICATION
          </button>
        </div>

        {/* Right Images */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          height: 450,
          marginLeft: 45
        }}>
          {rightImages.map((src, idx) => (
            <img
              key={"right" + idx}
              src={src}
              alt=""
              style={{
                width: 155,
                height: 155,
                objectFit: "cover",
                borderRadius: 18,
                border: "3px solid #FFC436",
                marginBottom: idx < 2 ? 15 : 0
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
