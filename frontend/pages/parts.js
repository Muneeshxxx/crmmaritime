import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PartManagement() {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
    axios.get('/api/parts').then(res => {
      // Sort descending by id (assuming id is numeric and higher means newer)
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setParts(sorted);
      setSearchResults(sorted);
      setCurrentPage(1);
    });
  }, [refresh]);
  // Search handler
  function handleSearch(e) {
    e.preventDefault();
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      setSearchResults(parts);
      return;
    }
    const filtered = parts.filter(part =>
      [
        part.part_name,
        part.model_number,
        part.article_name,
        part.article_number,
        part.part_pseudo_name
      ].some(field => field && field.toLowerCase().includes(keyword))
    );
    setSearchResults(filtered);
    setCurrentPage(1);
  }

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
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by Part #, Model #, Article Name, Article #, Pseudo Name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1.2rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
        </form>
        {/* Modern card grid for parts */}
        {(() => {
          const totalRecords = searchResults.length;
          const totalPages = Math.ceil(totalRecords / recordsPerPage);
          const startIdx = (currentPage - 1) * recordsPerPage;
          const pagedResults = searchResults.slice(startIdx, startIdx + recordsPerPage);
          return (
            <>
              <div className="parts-grid-header-modern">
                <div className="parts-col">Model #</div>
                <div className="parts-col">Article #</div>
                <div className="parts-col">Article Name</div>
                <div className="parts-col">Part Number</div>
                <div className="parts-col">Pseudo Name</div>
                <div className="parts-col">Weight</div>
                <div className="parts-col">Size</div>
                <div className="parts-col">Image</div>
                <div className="parts-col">Description</div>
                <div className="parts-col">Actions</div>
              </div>
              <div className="parts-grid-list-modern">
                {pagedResults.map(part => (
                  <div className="parts-grid-card-modern" key={part.id} onClick={() => setModal(part)}>
                    <div className="parts-grid-row-modern">
                      <div className="parts-col parts-link">{part.model_number}</div>
                      <div className="parts-col">{part.article_number}</div>
                      <div className="parts-col">{part.article_name}</div>
                      <div className="parts-col">{part.part_name}</div>
                      <div className="parts-col">{part.part_pseudo_name}</div>
                      <div className="parts-col">{part.part_weight}</div>
                      <div className="parts-col">{part.part_size}</div>
                      <div className="parts-col">{part.image && <img src={`/uploads/${part.image}`} alt="part" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}</div>
                      <div className="parts-col">{part.part_description}</div>
                      <div className="parts-col parts-action-btns" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleEdit(part)} className="parts-icon-btn parts-btn-edit" title="Edit">
                          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.85 2.85a2.12 2.12 0 0 1 3 3l-9.5 9.5-3.5.5.5-3.5 9.5-9.5zM13.5 2l-9.5 9.5a1 1 0 0 0-.29.62l-.5 3.5a1 1 0 0 0 1.13 1.13l3.5-.5a1 1 0 0 0 .62-.29l9.5-9.5a3.12 3.12 0 0 0-4.46-4.46z" fill="#fff"/>
                            <path d="M14.85 2.85a2.12 2.12 0 0 1 3 3l-9.5 9.5-3.5.5.5-3.5 9.5-9.5z" fill="#6366f1"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(part.id)} className="parts-icon-btn parts-btn-delete" title="Delete">
                          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="8" width="8" height="8" rx="2" fill="#fff"/>
                            <rect x="6" y="8" width="8" height="8" rx="2" fill="#e53e3e"/>
                            <path d="M8 10v4M12 10v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                            <rect x="7" y="4" width="6" height="2" rx="1" fill="#e53e3e"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination controls */}
              <div className="parts-pagination-modern">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="parts-page-btn-modern"
                >Prev</button>
                <span className="parts-page-info-modern">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="parts-page-btn-modern"
                >Next</button>
              </div>
            </>
          );
        })()}
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
        .parts-grid-header-modern {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr 1fr 2fr 1.2fr;
          align-items: center;
          background: linear-gradient(90deg, #e3eefd 0%, #f5f7fa 100%);
          font-weight: 700;
          border-radius: 14px 14px 0 0;
          padding: 1.2rem 0.5rem 1.2rem 0.5rem;
          box-shadow: 0 2px 12px #2563eb11;
          font-size: 1.13rem;
          margin-bottom: 0.5rem;
        }
        .parts-grid-list-modern {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .parts-grid-card-modern {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px #2563eb11;
          padding: 1.2rem 1.5rem;
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
          cursor: pointer;
        }
        .parts-grid-card-modern:hover {
          box-shadow: 0 8px 32px #2563eb22;
          background: #2563eb11;
          color: #2563eb;
        }
        .parts-grid-row-modern {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr 1fr 2fr 1.2fr;
          align-items: center;
          gap: 0.5rem;
        }
        .parts-col { font-size: 1.05rem; }
        .parts-link { color: #2563eb; text-decoration: underline; font-weight: 600; }
        .parts-action-btns {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          align-items: center;
        }
        .parts-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
          box-shadow: 0 2px 8px #6366f133;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          padding: 0;
        }
        .parts-btn-edit svg { display: block; }
        .parts-btn-edit {
          background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
        }
        .parts-btn-edit:hover {
          background: #2563eb;
          box-shadow: 0 4px 16px #6366f144;
        }
        .parts-btn-delete svg { display: block; }
        .parts-btn-delete {
          background: #e53e3e;
        }
        .parts-btn-delete:hover {
          background: #b91c1c;
          box-shadow: 0 4px 16px #e53e3e44;
        }
        .parts-pagination-modern {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        .parts-page-btn-modern {
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 2px 8px #6366f133;
          cursor: pointer;
          transition: background 0.15s;
        }
        .parts-page-btn-modern:disabled {
          background: #eee;
          color: #888;
          cursor: not-allowed;
        }
        .parts-page-info-modern {
          font-size: 1.08rem;
          color: #222;
          font-weight: 500;
        }
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
      `}</style>
    </div>
  );
}
