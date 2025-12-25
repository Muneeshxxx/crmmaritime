import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';


export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  function handleSearch() {
    axios.get(`/api/parts?q=${encodeURIComponent(search)}`).then(res => setResults(res.data));
  }

  return (
    <div className="search-container">
      <h1>Search Parts</h1>
      <div className="search-bar-row">
        <input
          type="text"
          placeholder="Type to search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>Search</button>
        {user && user.role === 'admin' && (
          <Link href="/parts">
            <button className="add-btn">Add Parts</button>
          </Link>
        )}
      </div>
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
        {results.map(part => (
          <div className="results-row" key={part.id}>
            <div className="model-col model-link" onClick={() => setSelected(part)} style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>{part.model_number}</div>
            <div className="article-col">{part.article_number}</div>
            <div className="article-name-col">{part.article_name}</div>
            <div className="part-name-col">{part.part_name}</div>
            <div className="pseudo-col">{part.part_pseudo_name}</div>
            <div className="weight-col">{part.part_weight}</div>
            <div className="size-col">{part.part_size}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.model_number}</h2>
            {selected.image && <img src={`/uploads/${selected.image}`} alt="part" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 16 }} />}
            <div className="modal-details-2col">
              <div className="modal-col modal-col-left">
                <div><b>Model Number:</b> {selected.model_number}</div>
                <div><b>Article Number:</b> {selected.article_number}</div>
                <div><b>Article Name:</b> {selected.article_name}</div>
                <div><b>Part Weight:</b> {selected.part_weight}</div>
                <div><b>Part Size:</b> {selected.part_size}</div>
              </div>
              <div className="modal-col modal-col-right">
                <div><b>Part Number:</b> {selected.part_name}</div>
                <div><b>Part Pseudo Name:</b> {selected.part_pseudo_name}</div>
              </div>
            </div>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
      <style jsx>{`
        .search-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .search-bar-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .search-input { flex: 1; padding: 0.75rem; font-size: 1.1rem; border-radius: 6px; border: 1px solid #ccc; }
        .search-btn { padding: 0.75rem 1.5rem; background: #0070f3; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .add-btn { padding: 0.75rem 1.5rem; background: #28a745; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .search-results-table { width: 100%; }
        .results-header, .results-row { display: grid; grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr; align-items: center; }
        .results-header { background: #f5f7fa; font-weight: 600; border-radius: 8px 8px 0 0; padding: 0.7rem 0; }
        .results-row { background: #fff; border-bottom: 1px solid #eee; padding: 0.7rem 0; transition: box-shadow 0.2s; cursor: pointer; }
        .results-row:hover { box-shadow: 0 4px 16px #0002; }
        .model-link:hover { color: #0051a3; }
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
