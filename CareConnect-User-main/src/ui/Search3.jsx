import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

const Input = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef(null);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedHistory);
  }, []);

  useEffect(() => {
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
    updatedHistory = updatedHistory.slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    setShowHistory(false);
    setLoading(true);
    document.body.style.cursor = 'none';
    document.body.style.overflow = 'hidden';  // Disable scrolling

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      navigate('/doctor-search'); // ✅ Navigate first
      setTimeout(() => {
        setLoading(false); // ✅ Only stop loading after navigation is complete
        document.body.style.overflow = 'auto';  
        document.body.style.cursor = 'default';
      }, 500); // Small delay to prevent home screen flicker
    }, 1000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative" ref={historyRef}>
      <input
        placeholder="Search..."
        className="input shadow-lg ring-1 ring-gray-300 focus:border-2 bg-white border-gray-300 px-5 py-3 rounded-xl w-[45vw] transition-all outline-none"
        type="search"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowHistory(e.target.value.length > 0);
        }}
        onFocus={() => setShowHistory(searchTerm.length > 0)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <svg
        className="size-6 absolute top-3 right-3 text-gray-500 cursor-pointer"
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
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute mt-4 top-12 left-0 w-[50vw] bg-white shadow-lg rounded-xl border border-gray-300" ref={historyRef}>
          <ul className="py-2">
            {searchHistory.slice(0, 5).map((term, index) => (
              <li key={index} className="px-4 py-2 flex items-center hover:bg-gray-100 cursor-pointer">
                <span onClick={() => setSearchTerm(term)} className="w-full text-left">
                  {term}
                </span>
                <button onClick={(e) => {
                  e.stopPropagation();
                  setSearchHistory(searchHistory.filter(item => item !== term));
                  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.filter(item => item !== term)));
                }} className="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button onClick={(e) => {
            e.stopPropagation();
            setSearchHistory([]);
            localStorage.removeItem('searchHistory');
          }} className="w-full text-center text-sm text-red-600 py-2 border-t hover:bg-gray-100">
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default Input;
