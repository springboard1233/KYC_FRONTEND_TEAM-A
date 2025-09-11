import { Link } from "react-router-dom"
import Prism from "../components/reactComponents/Prism/Prism"

const ScanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const DocsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l4.162-4.162m3.23-3.23l4.162 4.162a12.02 12.02 0 008.618-11.757 11.955 11.955 0 01-3.04-8.618z"
    />
  </svg>
)

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen">
      <header className="navbar bg-black/80 backdrop-blur-sm shadow-md px-4 fixed top-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-2xl font-bold text-white">
            KYC Verify
          </Link>
        </div>
        <div className="navbar-end hidden lg:flex">
          <ul className="menu menu-horizontal px-1 text-lg text-white">
            <li>
              <a href="#features">Features</a>
            </li>
            {/* <li><a href="#about">About</a></li> */}
          </ul>
        </div>
        <div className="navbar-end">
          <Link to="/login" className="btn btn-primary ml-2">
            Get Started
          </Link>
        </div>
        <div className="">
          <Link to="/admin/login" className="btn btn-primary ml-2">
            Admin
          </Link>
        </div>
      </header>

     <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
  <section className="hero min-h-screen pt-16 !bg-transparent">
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <Prism
        animationType="rotate"
        timeScale={0.5}
        height={3.5}
        baseWidth={5.5}
        scale={3.6}
        hueShift={0}
        colorFrequency={1}
        noise={0.5}
        glow={1}
      />
    </div>
    <div className="hero-content flex-col lg:flex-row-reverse text-center lg:text-left">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Instant, Secure, and Simple KYC Verification
        </h1>
        <p className="py-6 text-lg text-white">
          Leverage our advanced OCR technology to onboard customers in seconds.
          Upload a document and let our system do the rest.
        </p>
        <Link to="/signup" className="btn btn-primary btn-lg">
          Sign Up
        </Link>
      </div>
    </div>
  </section>

  {/* FEATURES SECTION */}
  <section id="features" className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Why Choose Us?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
   
        <div className="card bg-gray-800/50 backdrop-blur-sm shadow-xl transform hover:-translate-y-2 transition-transform duration-300 border border-gray-700">
          <figure className="px-10 pt-10">
            <ScanIcon />
          </figure>
          <div className="card-body items-center text-center">
            <h3 className="card-title text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Real-Time OCR
            </h3>
            <p className="text-white">
              Extract data from Aadhaar, PAN, and more in real-time as soon as the
              document is uploaded.
            </p>
          </div>
        </div>

        <div className="card bg-gray-800/50 backdrop-blur-sm shadow-xl transform hover:-translate-y-2 transition-transform duration-300 border border-gray-700">
          <figure className="px-10 pt-10">
            <DocsIcon />
          </figure>
          <div className="card-body items-center text-center">
            <h3 className="card-title text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Multi-Document Support
            </h3>
            <p className="text-white">
              Our system is built to handle multiple document types required for a
              comprehensive KYC check.
            </p>
          </div>
        </div>

        <div className="card bg-gray-800/50 backdrop-blur-sm shadow-xl transform hover:-translate-y-2 transition-transform duration-300 border border-gray-700">
          <figure className="px-10 pt-10">
            <ShieldIcon />
          </figure>
          <div className="card-body items-center text-center">
            <h3 className="card-title text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Secure & Compliant
            </h3>
            <p className="text-white">
              Your data is processed with security in mind, ensuring compliance
              and peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>


      <footer className="footer footer-center p-4 bg-black/80 backdrop-blur-sm text-white">
        <aside>
          <p>&copy; 2025 KYC Verify Inc. All rights reserved.</p>
        </aside>
      </footer>
    </div>
  )
}

export default LandingPage
