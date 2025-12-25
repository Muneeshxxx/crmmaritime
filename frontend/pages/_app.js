import { useState, useEffect } from 'react';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Login from './login';

export default function App({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <div style={{ marginLeft: 220, width: '100%' }}>
        <Component {...pageProps} user={user} />
      </div>
    </div>
  );
}
