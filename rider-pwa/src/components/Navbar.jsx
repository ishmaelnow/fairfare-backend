import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
          {user && (
            <li>
              <button onClick={handleLogout} className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

