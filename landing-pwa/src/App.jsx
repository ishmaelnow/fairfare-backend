// App.jsx (clean replacement) — only necessary fixes:
// 1) Sanitize VITE_* URLs so bad env values can't override your correct fallbacks
// 2) Keep Fleet as a normal page section (NOT inside navbar)

import { useState } from 'react'
import './App.css'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { Home } from './components/Home'


function safeExternalUrl(envValue, fallback) {
  const v = (envValue ?? '').trim()
  if (!v) return fallback
  if (!/^https?:\/\//i.test(v)) return fallback
  try {
    new URL(v)
    return v
  } catch {
    return fallback
  }
}

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  const riderUrl = safeExternalUrl(
    import.meta.env.VITE_RIDER_URL,
    'https://rider.fairfaretransportation.app'
  )

  const driverUrl = safeExternalUrl(
    import.meta.env.VITE_DRIVER_URL,
    'https://driver.fairfaretransportation.app'
  )

  const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' }

  if (showPrivacyPolicy) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <h2>FairFare</h2>
            </div>
            <ul className="nav-menu">
              <li>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Home
                </button>
              </li>
              <li>
                <a href={riderUrl} className="nav-link" {...externalLinkProps}>
                  Rider
                </a>
              </li>
              <li>
                <a href={driverUrl} className="nav-link" {...externalLinkProps}>
                  Driver
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <PrivacyPolicy />
      </div>
    )
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>FairFare</h2>
          </div>

          <ul className="nav-menu">
            <li><a href="/" className="nav-link active">Home</a></li>
            <li><a href={riderUrl} className="nav-link" {...externalLinkProps}>Rider</a></li>
            <li><a href={driverUrl} className="nav-link" {...externalLinkProps}>Driver</a></li>
            <li><a href="#fleet" className="nav-link">Fleet</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
            <li>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero + App cards */}
      <div className="container">
        <header>
          <h1>FairFare Transportation</h1>
          <p className="subtitle">Your comprehensive ride-sharing platform</p>
        </header>

        <div className="apps-grid">
          <a href={riderUrl} className="app-card rider" {...externalLinkProps}>
            <div className="vehicle-icon">
              <img src="/images/pavan.png" alt="FairFare rider vehicle" />
            </div>
            <h2>Rider</h2>
            <p>Book rides and track your driver in real-time</p>
          </a>

          <a href={driverUrl} className="app-card driver" {...externalLinkProps}>
            <div className="vehicle-icon">
              <img src="/images/left-image.png" alt="FairFare driver SUV taxi" />
            </div>
            <h2>Driver</h2>
            <p>Accept rides and manage your trips</p>
          </a>
        </div>
      </div>
      {/* Home Content */}
      <div className="container home-container">
        <Home />
      </div>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <h2>About FairFare</h2>
          <p className="section-text">
            FairFare Transportation is a comprehensive ride-sharing platform designed to connect riders
            with reliable drivers. We provide a seamless experience for booking rides, managing trips,
            and ensuring safe transportation for everyone.
          </p>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🚗</div>
              <h3>Easy Booking</h3>
              <p>Book rides quickly and easily with our intuitive platform</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <h3>Real-Time Tracking</h3>
              <p>Track your driver's location in real-time</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p className="section-text">Have questions or need support? We're here to help!</p>

          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <h3>Email Support</h3>
              <a href="mailto:support@fairfaretransportation.app" className="contact-link">
                support@fairfaretransportation.app
              </a>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <a href="tel:4692688239" className="contact-link">(469) 268-8239</a>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <a href="tel:4698357520" className="contact-link">(469) 835-7520</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} FairFare Transportation. All rights reserved.</p>
          <p style={{ marginTop: '15px' }}>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ccc',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
