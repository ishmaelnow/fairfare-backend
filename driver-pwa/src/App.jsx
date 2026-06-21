import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signOut } from './lib/auth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import DriverSignup from './pages/DriverSignup';
import Dashboard from './pages/Dashboard';
import MyRides from './pages/MyRides';
import ActiveRide from './pages/ActiveRide';
import Wallet from './pages/Wallet';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  const handleLogin = () => {
    // Auth state will update automatically via AuthContext
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const isAuthenticated = !!user;

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route 
            path="/driver-signup" 
            element={isAuthenticated ? <DriverSignup /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-rides" 
            element={isAuthenticated ? <MyRides onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route
            path="/ride/:rideId"
            element={isAuthenticated ? <ActiveRide /> : <Navigate to="/login" />}
          />
          <Route
            path="/wallet"
            element={isAuthenticated ? <Wallet /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
