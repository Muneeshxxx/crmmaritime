import { useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
import { useRouter } from 'next/router';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) {
          onLogin(data.user);
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ width: 64, height: 64, marginBottom: 12, borderRadius: 12, boxShadow: '0 2px 8px #0001' }} onError={e => e.target.style.display='none'} />
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#222', marginBottom: 4 }}>Sign in</h2>
          <div style={{ color: '#666', fontSize: '1rem' }}>Access your account</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {error && <div style={{ color: '#e53e3e', textAlign: 'center', fontWeight: 500, marginBottom: 8 }}>{error}</div>}
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', marginBottom: 8 }}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', marginBottom: 8 }}
          />
          <button
            type="submit"
            style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 2px 8px #6366f133', cursor: 'pointer', marginTop: 8 }}
          >
            Sign in
          </button>
        </form>
        <div style={{ textAlign: 'center', color: '#888', fontSize: '0.95rem', marginTop: 8 }}>
          &copy; {new Date().getFullYear()} SLeng Maritime
        </div>
      </div>
    </div>
  );
}
