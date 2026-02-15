import './Home.css'

export function Home() {
  const features = [
    { title: "Quick and Easy Booking", description: "Book your ride in just a few clicks." },
    { title: "Affordable Pricing", description: "Get the best rates for your journeys." },
    { title: "24/7 Service", description: "Available anytime you need a ride in the Dallas/Fort Worth area." },
    { title: "Wheelchair Accessible", description: "Wheelchair-accessible vehicles are available upon request." },
  ]

  const taxiRates = [
    { category: "Initial Meter Drop", price: "$3.00" },
    { category: "Per 1/4 Mile", price: "$0.70" },
    { category: "Traffic Delay / Waiting Time (Per Min)", price: "$0.40" },
    { category: "Extra Passenger", price: "$2.00" },
    { category: "Minimum Charge (Love Field Airport)", price: "$10.00" },
    { category: "Love Field Trip Fee", price: "$2.00" },
    { category: "Flat Rate (Love Field ↔ Dallas Central Business District)", price: "$26.00" },
    { category: "Flat Rate (DFW Airport ↔ Dallas Central Business District)", price: "$55.00" },
    { category: "DFW Airport Exit Fee", price: "$5.00" },
    { category: "DFW Airport Drop-off Fee", price: "$4.00" },
    { category: "Minimum Fare (DFW Airport to Off-Airport)", price: "$27.00" },
  ]

  const base = import.meta.env.BASE_URL

  return (
    <div className="home-content">
      {/* Fleet Section */}
      <section id="fleet" className="home-section fleet-section">
        <h2>Our Vehicles</h2>
        <p className="fleet-subtitle">
          A quick look at the fleet available on FairFare.
        </p>

        <div className="fleet-card">
          <div className="fleet-grid">
            <div className="fleet-img-wrap">
              <img
                src={`${base}images/left-image.png`}
                alt="Vehicle - Left"
                className="fleet-img"
                loading="lazy"
              />
            </div>

            <div className="fleet-img-wrap">
              <img
                src={`${base}images/pavan.png`}
                alt="Vehicle - Pavan"
                className="fleet-img"
                loading="lazy"
              />
            </div>

            <div className="fleet-img-wrap">
              <img
                src={`${base}images/van.png`}
                alt="Vehicle - Van"
                className="fleet-img"
                loading="lazy"
              />
            </div>

            <div className="fleet-img-wrap">
              <img
                src={`${base}images/right-image.png`}
                alt="Vehicle - Right"
                className="fleet-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section">
        <h2>Why Choose FairFare Transportation?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Taxi Rates Section */}
      <section className="home-section">
        <h2>Taxi Rates</h2>
        <div className="rates-table-container">
          <table className="rates-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {taxiRates.map((rate, index) => (
                <tr key={index}>
                  <td>{rate.category}</td>
                  <td className="price-cell">{rate.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
