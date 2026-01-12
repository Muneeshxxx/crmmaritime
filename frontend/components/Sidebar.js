import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar({ user, onLogout }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        style={{ position: 'fixed', left: open ? 230 : 0, top: 20, zIndex: 200, background: '#0070f3', color: '#fff', border: 'none', borderRadius: '0 6px 6px 0', padding: '0.5rem 0.7rem', cursor: 'pointer', transition: 'left 0.2s' }}
      >
        {open ? '⏴' : '⏵'}
      </button>
      <aside className="sidebar" style={{ width: open ? 230 : 0, minWidth: open ? 230 : 0, overflow: 'hidden', transition: 'width 0.2s, min-width 0.2s' }}>
        <div className="sidebar-logo" style={{ display: open ? 'block' : 'none' }}>
          <img src="/logo.png" alt="Logo" style={{ width: 180, height: 64, objectFit: 'contain' }} />
        </div>
        <nav className="sidebar-menu" style={{ display: open ? 'flex' : 'none' }}>
          <Link href="/">
            <span><span className="icon">🏠</span> Dashboard</span>
          </Link>
          <Link href="/search">
            <span><span className="icon">🔍</span> Search</span>
          </Link>
          <Link href="/profile">
            <span><span className="icon">👤</span> Profile</span>
          </Link>
          {user && user.role === 'admin' && (
            <>
              <Link href="/parts">
                <span><span className="icon">➕</span> Add Product</span>
              </Link>
              <Link href="/upload-csv">
                <span><span className="icon">⬆️</span> Upload Data</span>
              </Link>
              <Link href="/users">
                <span><span className="icon">👥</span> Manage Users</span>
              </Link>
            </>
          )}
        </nav>
        {user && (
          <div className="sidebar-user" style={{ display: open ? 'block' : 'none', position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="user-avatar" style={{ width: '32px', height: '32px', background: '#ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user.name}</span>
            </div>
            <button onClick={onLogout} style={{ width: '100%', padding: '0.5rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        )}
        <style jsx>{`
          .sidebar {
            background: linear-gradient(180deg, #f8fafc 0%, #e9f0f7 100%);
            min-height: 100vh;
            box-shadow: 2px 0 12px #0001;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 2rem;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 100;
          }
          .sidebar-logo {
            margin-bottom: 2.5rem;
          }
          .sidebar-menu {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            width: 100%;
          }
          .sidebar-menu a {
            color: #222;
            text-decoration: none;
            font-size: 1.13rem;
            padding: 0.85rem 2.2rem;
            border-radius: 8px;
            transition: background 0.15s, color 0.15s;
            display: flex;
            align-items: center;
          }
          .sidebar-menu a:hover, .sidebar-menu a.active {
            background: #e3eefd;
            color: #0070f3;
          }
          .icon {
            margin-right: 0.7em;
            font-size: 1.2em;
          }
        `}</style>
      </aside>
    </>
  );
}
