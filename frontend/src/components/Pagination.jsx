import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const {
    currentPage = 1,
    limit = 10,
    totalContacts = 0,
    totalPages = 1,
    hasNextPage = false,
    hasPrevPage = false,
  } = pagination || {};

  const startCount = totalContacts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endCount = Math.min(currentPage * limit, totalContacts);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing <strong>{startCount}</strong> to <strong>{endCount}</strong> of{' '}
          <strong>{totalContacts}</strong> contacts
        </span>
      </div>

      <div className="pagination-controls">
        <div className="select-wrapper">
          <label htmlFor="limit-select">Per page:</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          title="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <span style={{ margin: '0 0.5rem', fontWeight: 600 }}>
          {currentPage} / {totalPages}
        </span>

        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          title="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
