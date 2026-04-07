
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Input = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedHistory);
  }, []);

  useEffect(() => {
    // Hide history when clicking outside
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Search box cannot be empty!');
      return;
    }

    let updatedHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)];
    updatedHistory = updatedHistory.slice(0, 10); // Keep max 10 searches

    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    setShowHistory(false); // Hide history after searching
    navigate('/doctor-search', { state: { searchTerm } }); // Redirect to search results
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const deleteHistoryItem = (e, item) => {
    e.stopPropagation(); // Prevent history from hiding
    const updatedHistory = searchHistory.filter(historyItem => historyItem !== item);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = (e) => {
    e.stopPropagation(); // Prevent history from hiding
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    setShowHistory(false);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="relative" ref={historyRef}>
      <input
        placeholder="Search for doctor..."
        className="input shadow-lg ring-1 ring-gray-300 focus:border-2 bg-white border-gray-300 px-5 py-3 rounded-xl w-[40vw] transition-all focus:w-[50vw] outline-none"
        name="search"
        type="search"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowHistory(e.target.value.length > 0);
        }}
        onFocus={() => setShowHistory(searchTerm.length > 0)}
        onKeyDown={handleKeyDown}
      />
      <svg
        className="size-6 bg-orange-300 absolute top-3 right-3 text-gray-500 cursor-pointer"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleSearch}
      >
        <path
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Show history suggestions only while typing */}
      {showHistory && searchHistory.length > 0 && (
        <div
          className="absolute mt-4 top-12 left-0 w-[50vw] bg-white shadow-lg rounded-xl border border-gray-300"
          ref={historyRef}
        >
          <ul className="py-2">
            {searchHistory.slice(0, 5).map((term, index) => (
              <li
                key={index}
                className="px-4 py-2 flex items-center hover:bg-gray-100 cursor-pointer"
              >
                <span
                  onClick={() => handleHistoryClick(term)}
                  className="w-full text-left"
                >
                  {term}
                </span>
                <button
                  onClick={(e) => deleteHistoryItem(e, term)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={(e) => clearHistory(e)}
            className="w-full text-center text-sm text-red-600 py-2 border-t hover:bg-gray-100"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default Input;