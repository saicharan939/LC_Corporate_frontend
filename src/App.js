// App.js, Admin.js
// This file contains the React components for the URL shortener's user interface.
// It uses React Router for navigation and Axios for API requests.

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';

// --- Configuration ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- Main App Component ---
function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white font-sans">
        <div className="container mx-auto p-4 md:p-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-2">URL Shorty</h1>
            <p className="text-gray-400 text-lg">The simplest way to shorten your links.</p>
          </header>

          <nav className="flex justify-center space-x-6 mb-12">
            <Link to="/" className="text-gray-300 hover:text-cyan-400 transition duration-300 text-lg pb-1 border-b-2 border-transparent hover:border-cyan-400">Home</Link>
            <Link to="/admin" className="text-gray-300 hover:text-cyan-400 transition duration-300 text-lg pb-1 border-b-2 border-transparent hover:border-cyan-400">Admin</Link>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<UrlShortenerForm />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

// --- URL Shortener Form Component ---
function UrlShortenerForm() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl(null);
    setCopySuccess('');
    if (!longUrl) {
        setError('Please enter a URL to shorten.');
        return;
    }
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/shorten`, { longUrl });
      setShortUrl(res.data);
    } catch (err) {
      setError('Failed to shorten URL. Please check the link and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
        setCopySuccess('Failed to copy!');
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl shadow-cyan-500/10">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="url"
            className="w-full px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            placeholder="https://your-long-url.com/goes-here"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '...' : 'Shorten'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {shortUrl && (
        <div className="mt-8 p-6 bg-gray-700 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Your Shortened URL:</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={shortUrl.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 text-xl font-mono break-all hover:underline"
            >
              {shortUrl.shortUrl}
            </a>
            <button
              onClick={() => copyToClipboard(shortUrl.shortUrl)}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              {copySuccess || 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// --- Admin Page Component ---
function AdminPage() {
  // Initialize state with an empty array to prevent .map() errors
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/urls`);
        // Ensure that the response data is an array before setting the state
        if (Array.isArray(res.data)) {
            setUrls(res.data);
        } else {
            // If the response is not an array, it's an unexpected format
            setError('Received an invalid format from the server.');
        }
      } catch (err) {
        setError('Failed to fetch URL list.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  if (loading) return <p className="text-center text-lg">Loading analytics...</p>;
  if (error) return <p className="text-center text-lg text-red-400">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-2xl shadow-cyan-500/10">
      <h2 className="text-3xl font-bold text-center mb-8 text-cyan-400">Link Analytics</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-300">Original URL</th>
              <th className="px-4 py-3 font-semibold text-gray-300">Short URL</th>
              <th className="px-4 py-3 font-semibold text-gray-300 text-center">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {urls.length > 0 ? (
                urls.map((url) => (
                  <tr key={url._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4 break-all text-gray-400">
                        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{url.originalUrl}</a>
                    </td>
                    <td className="px-4 py-4">
                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{url.shortUrl}</a>
                    </td>
                    <td className="px-4 py-4 text-center text-xl font-bold">{url.clicks}</td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">No links have been shortened yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
