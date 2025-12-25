import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PartManagement() {
  const [parts, setParts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    model_number: '',
    article_number: '',
    article_name: '',
    part_name: '',
    part_pseudo_name: '',
    part_description: '',
    part_weight: '',
    part_size: '',
    image: null,
  });
  const [refresh, setRefresh] = useState(0);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (search) params.q = search;
    axios.get('/api/parts', { params }).then(res => {
      setParts(res.data.parts);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    });
  }, [page, search, refresh]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }

  function handleEdit(part) {
    setEditing(part.id);
    setForm({ ...part, image: null });
  }

  function handleCancel() {
    setEditing(null);
    setForm({
      model_number: '',
      article_number: '',
      article_name: '',
      part_name: '',
      part_pseudo_name: '',
      part_description: '',
      part_weight: '',
      part_size: '',
      image: null,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) data.append(k, v);
    });
    if (editing) {
      await axios.put(`/api/parts/${editing}`, data);
    } else {
      await axios.post('/api/parts', data);
    }
    setRefresh(r => r + 1);
    handleCancel();
  }

  async function handleDelete(id) {
    if (confirm('Delete this part?')) {
      await axios.delete(`/api/parts/${id}`);
      setRefresh(r => r + 1);
    }
  }

  return (
    <div className="part-mgmt-container">
      <h1>Add / Edit Product Part</h1>
      <form className="part-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="model_number">Model Number</label>
            <input id="model_number" name="model_number" value={form.model_number} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="article_number">Article Number</label>
            <input id="article_number" name="article_number" value={form.article_number} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="article_name">Article Name</label>
            <input id="article_name" name="article_name" value={form.article_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="part_name">Part Number</label>
            <input id="part_name" name="part_name" value={form.part_name} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="part_pseudo_name">Part Pseudo Name</label>
            <textarea id="part_pseudo_name" name="part_pseudo_name" value={form.part_pseudo_name} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label htmlFor="part_weight">Part Weight</label>
            <input id="part_weight" name="part_weight" value={form.part_weight} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="part_size">Part Size</label>
            <input id="part_size" name="part_size" value={form.part_size} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="part_description">Part Description</label>
            <textarea id="part_description" name="part_description" value={form.part_description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <button type="submit">{editing ? 'Update' : 'Add'} Part</button>
          {editing && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>
      <div className="part-list">
        <h2>All Parts</h2>
        <div className="search-paging">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search parts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
            />
          </div>
          <div className="paging">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Model #</th>
              <th>Article #</th>
              <th>Article Name</th>
              <th>Part Number</th>
              <th>Pseudo Name</th>
              <th>Weight</th>
              <th>Size</th>
              <th>Image</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(part => (
              <tr key={part.id} className="clickable-row" onClick={() => setModal(part)} style={{ cursor: 'pointer' }}>
                <td style={{ color: '#0070f3', textDecoration: 'underline' }}>{part.model_number}</td>
                <td>{part.article_number}</td>
                <td>{part.article_name}</td>
                <td>{part.part_name}</td>
                <td>{part.part_pseudo_name}</td>
                <td>{part.part_weight}</td>
                <td>{part.part_size}</td>
                <td>{part.image && <img src={`/uploads/${part.image}`} alt="part" style={{ width: 40, height: 40, objectFit: 'cover' }} />}</td>
                <td>{part.part_description}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(part)}>Edit</button>
                  <button onClick={() => handleDelete(part.id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modal && (
          <div className="modal-bg" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{modal.model_number}</h2>
              {modal.image && <img src={`/uploads/${modal.image}`} alt="part" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 16 }} />}
              <div className="modal-details-2col">
                <div className="modal-col modal-col-left">
                  <div><b>Model Number:</b> {modal.model_number}</div>
                  <div><b>Article Number:</b> {modal.article_number}</div>
                  <div><b>Article Name:</b> {modal.article_name}</div>
                  <div><b>Part Weight:</b> {modal.part_weight}</div>
                  <div><b>Part Size:</b> {modal.part_size}</div>
                  <div><b>Part Description:</b> {modal.part_description}</div>
                </div>
                <div className="modal-col modal-col-right">
                  <div><b>Part Number:</b> {modal.part_name}</div>
                  <div><b>Part Pseudo Name:</b> {modal.part_pseudo_name}</div>
                </div>
              </div>
              <button onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .part-mgmt-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .part-form { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 1.5rem; margin-bottom: 2rem; }
        .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; flex: 1; }
        .form-group label { font-weight: 500; margin-bottom: 0.3rem; color: #333; }
        .form-group input, .form-group textarea { padding: 0.6rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
        .form-group textarea { min-height: 38px; }
        .form-row input[type="file"] { flex: 1; }
        .form-row button { padding: 0.5rem 1.2rem; background: #0070f3; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .form-row button[type="button"] { background: #aaa; margin-left: 1rem; }
        .part-list table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
        .part-list th, .part-list td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
        .part-list th { background: #f5f5f5; }
        .part-list img { border-radius: 4px; }
        .modal-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0008; display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; border-radius: 10px; padding: 2rem; min-width: 320px; max-width: 90vw; box-shadow: 0 8px 32px #0003; position: relative; }
        .modal-details-2col {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }
        .modal-col {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .modal-col-left {
          min-width: 180px;
        }
        .modal-col-right {
          min-width: 180px;
        }
        .modal button { margin-top: 1rem; padding: 0.5rem 1.5rem; background: #0070f3; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .search-paging { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .paging { display: flex; gap: 1rem; align-items: center; }
        .paging button { padding: 0.5rem 1rem; background: #0070f3; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .paging button:disabled { background: #ccc; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
