import { Link, useNavigate } from 'react-router-dom';
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
        <Link to={user ? '/dashboard' : '/login'} className="navbar-logo">
          <h3>FairFare</h3>
        </Link>
        <ul className="navbar-menu">
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/book-ride" className="navbar-link">
                  Book ride
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="navbar-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

