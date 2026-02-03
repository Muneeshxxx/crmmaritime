import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Login from './login';

export default function App({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      if (router.pathname === '/login') {
        router.replace('/');
      }
    } else {
      if (router.pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    router.replace('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/login');
  };

  if (!isAuthenticated && router.pathname !== '/login') {
    return null;
  }
  if (!isAuthenticated && router.pathname === '/login') {
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
