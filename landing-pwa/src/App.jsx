import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>FairFare</h2>
          </div>
          <ul className="nav-menu">
            <li><a href="/" className="nav-link active">Home</a></li>
            <li><a href="https://rider.fairfaretransportation.app" className="nav-link">Rider</a></li>
            <li><a href="https://driver.fairfaretransportation.app" className="nav-link">Driver</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <div className="container">
        <header>
          <h1>FairFare Transportation</h1>
          <p className="subtitle">Your comprehensive ride-sharing platform</p>
        </header>

        <div className="apps-grid">
          <a 
            href="https://rider.fairfaretransportation.app" 
            className="app-card rider"
          >
            <div className="icon">🚗</div>
            <h2>Rider</h2>
            <p>Book rides and track your driver in real-time</p>
          </a>

          <a 
            href="https://driver.fairfaretransportation.app" 
            className="app-card driver"
          >
            <div className="icon">🚙</div>
            <h2>Driver</h2>
            <p>Accept rides and manage your trips</p>
          </a>
        </div>
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
          <p className="section-text">
            Have questions or need support? We're here to help!
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <h3>Email Support</h3>
              <a href="mailto:support@fairfaretransportation.app" className="contact-link">
                support@fairfaretransportation.app
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} FairFare Transportation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App

