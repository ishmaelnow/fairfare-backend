import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="app-navbar">
      <div className="navbar-container">
        <a href="https://fairfaretransportation.app" className="navbar-logo">
          <h3>FairFare</h3>
        </a>
        <ul className="navbar-menu">
          <li><a href="https://fairfaretransportation.app" className="navbar-link">Home</a></li>
          <li><a href="https://rider.fairfaretransportation.app" className="navbar-link">Rider</a></li>
          <li><a href="https://driver.fairfaretransportation.app" className="navbar-link">Driver</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

