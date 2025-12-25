
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';


export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [parts, setParts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    axios.get('/api/parts').then(res => {
      setParts(res.data);
      setFiltered(res.data);
    });
  }, []);

  function handleSearch() {
    setFiltered(
      !search
        ? parts
        : parts.filter(p =>
            [p.model_number, p.article_number, p.article_name, p.part_name, p.part_pseudo_name].some(f => f && f.toLowerCase().includes(search.toLowerCase()))
          )
    );
  }


  // Model and Parts count
  const modelCount = Array.isArray(parts) ? new Set(parts.map(p => p.model_number)).size : 0;
  const partsCount = Array.isArray(parts) ? parts.length : 0;

  return (
    <div className="dashboard-container">
      <h1>Marine Product Catalog CRM</h1>
      <div className="dashboard-cards-count">
        <div className="count-card model-card">
          <div className="count-title">Model Count</div>
          <div className="count-value">{modelCount}</div>
        </div>
        <div className="count-card parts-card">
          <div className="count-title">Parts Count</div>
          <div className="count-value">{partsCount}</div>
        </div>
      </div>
      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search by Model, Article, Name, Pseudo Name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
        <Link href="/parts">
          <button>Add / Manage Parts</button>
        </Link>
      </div>
      {/* Search Results Grid (same as search page) */}
      <div className="search-results-table">
        <div className="results-header">
          <div className="model-col">Model Number</div>
          <div className="article-col">Article Number</div>
          <div className="article-name-col">Article Name</div>
          <div className="part-name-col">Part Number</div>
          <div className="pseudo-col">Part Pseudo Name</div>
          <div className="weight-col">Part Weight</div>
          <div className="size-col">Part Size</div>
        </div>
        {Array.isArray(filtered) && filtered.map(part => (
          <div className="results-row" key={part.id}>
            <div className="model-col model-link" onClick={() => setModal(part)} style={{ color: '#d32f2f', cursor: 'pointer', textDecoration: 'underline' }}>{part.model_number}</div>
            <div className="article-col">{part.article_number}</div>
            <div className="article-name-col">{part.article_name}</div>
            <div className="part-name-col">{part.part_name}</div>
            <div className="pseudo-col">{part.part_pseudo_name}</div>
            <div className="weight-col">{part.part_weight}</div>
            <div className="size-col">{part.part_size}</div>
          </div>
        ))}
      </div>
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
      <style jsx>{`
        .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .dashboard-cards-count { display: flex; gap: 2rem; margin-bottom: 2rem; }
        .count-card { flex: 1; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .model-card { border-top: 6px solid #d32f2f; }
        .parts-card { border-top: 6px solid #fbc02d; }
        .count-title { font-size: 1.2rem; color: #222; margin-bottom: 0.5rem; font-weight: 600; }
        .count-value { font-size: 2.5rem; font-weight: bold; color: #222; }
        .dashboard-search { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .dashboard-search input { flex: 1; padding: 0.75rem; font-size: 1.1rem; border-radius: 6px; border: 1px solid #222; }
        .dashboard-search button { padding: 0.75rem 1.5rem; background: #d32f2f; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .dashboard-search button:last-child { background: #222; color: #fff; }
        .search-results-table { width: 100%; }
        .results-header, .results-row { display: grid; grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr; align-items: center; }
        .results-header { background: #fbc02d; color: #222; font-weight: 600; border-radius: 8px 8px 0 0; padding: 0.7rem 0; }
        .results-row { background: #fff; border-bottom: 1px solid #eee; padding: 0.7rem 0; transition: box-shadow 0.2s; cursor: pointer; }
        .results-row:hover { box-shadow: 0 4px 16px #d32f2f22; }
        .model-link:hover { color: #222; }
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
        .modal button { margin-top: 1rem; padding: 0.5rem 1.5rem; background: #d32f2f; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        h1 { margin-bottom: 1.5rem; color: #d32f2f; }
        @media (max-width: 900px) {
          .results-header, .results-row { grid-template-columns: 1fr 1fr 1.5fr 1.5fr 1.5fr 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .results-header, .results-row { grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr; font-size: 0.95em; }
        }
      `}</style>
    </div>
  );
}
