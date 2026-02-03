import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';


export default function SearchPage({ user }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  function handleSearch() {
    fetch(`/api/parts?q=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setCurrentPage(1);
      });
  }

  function handleSort(field) {
    let order = sortOrder;
    if (sortField === field) {
      order = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      order = 'asc';
    }
    setSortField(field);
    setSortOrder(order);
  }

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    if (!sortField) return 0;
    const valA = (a[sortField] || '').toString().toLowerCase();
    const valB = (b[sortField] || '').toString().toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / recordsPerPage);
  const pagedResults = sortedResults.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="search-container">
      <div className="search-bar-card">
        <h2 className="search-title">Marine Parts Search</h2>
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
      </div>
      <div className="search-results-table">
        {results.length > 0 && (
          <div className="results-header pro-grid-header-modern">
            <div className="model-col sortable" onClick={() => handleSort('model_number')}>Model Number {sortField === 'model_number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="article-col sortable" onClick={() => handleSort('article_number')}>Article Number {sortField === 'article_number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="article-name-col sortable" onClick={() => handleSort('article_name')}>Article Name {sortField === 'article_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="part-name-col sortable" onClick={() => handleSort('part_name')}>Part Number {sortField === 'part_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="pseudo-col sortable" onClick={() => handleSort('part_pseudo_name')}>Part Pseudo Name {sortField === 'part_pseudo_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="weight-col sortable" onClick={() => handleSort('part_weight')}>Part Weight {sortField === 'part_weight' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
            <div className="size-col sortable" onClick={() => handleSort('part_size')}>Part Size {sortField === 'part_size' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</div>
          </div>
        )}
        <div className="modern-grid-list">
          {pagedResults.map(part => (
            <div className="modern-grid-card" key={part.id} onClick={() => setSelected(part)}>
              <div className="modern-grid-row">
                <div className="model-col model-link">{part.model_number}</div>
                <div className="article-col">{part.article_number}</div>
                <div className="article-name-col">{part.article_name}</div>
                <div className="part-name-col">{part.part_name}</div>
                <div className="pseudo-col">{part.part_pseudo_name}</div>
                <div className="weight-col">{part.part_weight}</div>
                <div className="size-col">{part.part_size}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination controls */}
        {results.length > 0 && (
          <div className="pro-pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pro-page-btn"
            >Prev</button>
            <span className="pro-page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pro-page-btn"
            >Next</button>
          </div>
        )}
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
        .search-bar-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #0001; padding: 2rem 2.5rem 1.5rem 2.5rem; margin-bottom: 2.5rem; display: flex; flex-direction: column; align-items: center; }
        .search-title { font-size: 2rem; font-weight: 700; color: #222; margin-bottom: 1.2rem; letter-spacing: 0.02em; }
        .search-bar-row { display: flex; gap: 1rem; width: 100%; max-width: 700px; }
        .search-input { flex: 1; padding: 0.75rem; font-size: 1.1rem; border-radius: 6px; border: 1px solid #ccc; }
        .search-btn { padding: 0.75rem 1.5rem; background: linear-gradient(90deg, #6366f1 0%, #2563eb 100%); color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px #6366f133; }
        .add-btn { padding: 0.75rem 1.5rem; background: #28a745; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .search-results-table { width: 100%; margin-top: 1.5rem; }
        .results-header, .results-row { display: grid; grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr; align-items: center; }
        .pro-grid-header {
          background: linear-gradient(90deg, #f5f7fa 0%, #e3eefd 100%);
          font-weight: 700;
          border-radius: 10px 10px 0 0;
          padding: 1rem 0;
          box-shadow: 0 2px 8px #0001;
          font-size: 1.08rem;
        }
        .pro-grid-header-modern {
          background: linear-gradient(90deg, #e3eefd 0%, #f5f7fa 100%);
          font-weight: 700;
          border-radius: 14px 14px 0 0;
          padding: 1.2rem 0.5rem 1.2rem 0.5rem;
          box-shadow: 0 2px 12px #2563eb11;
          font-size: 1.13rem;
          margin-bottom: 0.5rem;
        }
        .modern-grid-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .modern-grid-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px #2563eb11;
          padding: 1.2rem 1.5rem;
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
          cursor: pointer;
        }
        .modern-grid-card:hover {
          box-shadow: 0 8px 32px #2563eb22;
          background: #2563eb11;
          color: #2563eb;
        }
        .modern-grid-row {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 2fr 2fr 2fr 1fr 1fr;
          align-items: center;
          gap: 0.5rem;
        }
        .pro-pagination {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        .pro-page-btn {
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
        .pro-page-btn:disabled {
          background: #eee;
          color: #888;
          cursor: not-allowed;
        }
        .pro-page-info {
          font-size: 1.08rem;
          color: #222;
          font-weight: 500;
        }
        .results-header { background: #f5f7fa; font-weight: 600; border-radius: 8px 8px 0 0; padding: 0.7rem 0; box-shadow: 0 2px 8px #0001; }
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
