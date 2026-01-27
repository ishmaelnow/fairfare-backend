import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signOut } from './lib/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated && isAdmin ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
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
