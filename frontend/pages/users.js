import { useState, useEffect } from 'react';

export default function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setMessage('Failed to load users.');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${editId}` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editId ? 'User updated.' : 'User created.');
        setShowForm(false);
        setEditId(null);
        setForm({ name: '', email: '', password: '', role: 'Viewer' });
        fetchUsers();
      } else {
        setMessage(data.message || 'Operation failed.');
      }
    } catch {
      setMessage('Error saving user.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User deleted.');
        fetchUsers();
      } else {
        setMessage(data.message || 'Delete failed.');
      }
    } catch {
      setMessage('Error deleting user.');
    }
  }

  function handleEdit(user) {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  }

  return (
    <div className="users-page-modern">
      <h1>Users</h1>
      {isAdmin && (
        <button className="users-btn-add" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', email: '', password: '', role: 'Viewer' }); }}>Add User</button>
      )}
      {message && <div className="users-message-modern">{message}</div>}
      {showForm && (
        <form className="users-form-modern" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <input type="password" placeholder={editId ? 'New Password (optional)' : 'Password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editId} />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </select>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="users-btn-save">{editId ? 'Update' : 'Create'}</button>
            <button type="button" className="users-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="users-grid-modern">
        {loading ? <div>Loading...</div> : (
          users.length === 0 ? <div>No users found.</div> : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    {isAdmin && (
                      <td>
                        <button className="users-btn-edit" onClick={() => handleEdit(u)} title="Edit">✏️</button>
                        <button className="users-btn-delete" onClick={() => handleDelete(u.id)} title="Delete">🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
      <style jsx>{`
        .users-page-modern { max-width: 900px; margin: 2rem auto; padding: 2rem; }
        .users-btn-add {
          background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.4rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
        }
        .users-message-modern { margin-bottom: 1rem; color: #2563eb; font-weight: 500; }
        .users-form-modern {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px #2563eb11;
          padding: 2rem 2.5rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .users-form-modern input, .users-form-modern select {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
        .users-btn-save {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.4rem;
          margin-right: 0.7rem;
          cursor: pointer;
        }
        .users-btn-cancel {
          background: #eee;
          color: #222;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
        }
        .users-grid-modern table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px #0001;
        }
        .users-grid-modern th, .users-grid-modern td {
          padding: 0.7rem;
          border-bottom: 1px solid #eee;
          text-align: left;
        }
        .users-grid-modern th { background: #f5f5f5; }
        .users-btn-edit {
          background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.3rem 0.7rem;
          margin-right: 0.5rem;
          cursor: pointer;
        }
        .users-btn-delete {
          background: #e53e3e;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.3rem 0.7rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
