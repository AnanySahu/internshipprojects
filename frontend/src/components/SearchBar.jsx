import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search by name, email, or phone...' }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  // Debounce search input by 350ms to prevent flooding the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, onChange, value]);

  // Sync if external value changes (e.g. cleared externally)
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className="search-box">
      <Search className="search-icon" size={18} />
      <input
        type="search"
        className="search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search contacts"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear"
          aria-label="Clear search query"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
