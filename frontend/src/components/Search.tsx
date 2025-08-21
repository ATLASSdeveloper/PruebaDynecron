import React, { useState } from 'react';
import { apiService } from '../services/api';
import { SearchResult } from '../types/searchResult';
import { useRateLimit } from '../hooks/useRateLimit';
import RateLimitNotification from './RateLimitNotification';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const { rateLimit, resetRateLimit } = useRateLimit();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      setHasSearched(false);
      return;
    }

    if (rateLimit.isLimited) {
      setError(rateLimit.message);
      return;
    }

    setIsSearching(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const searchResults = await apiService.search(query);
      setResults(searchResults);
    } catch (error: any) {
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Límite de solicitudes excedido. Por favor espere.');
      } else {
        setError('Error en la búsqueda. Intenta nuevamente.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !rateLimit.isLimited) {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (hasSearched) {
      setHasSearched(false);
      setResults([]);
    }
    if (error) setError('');
  };

  return (
    <div className="search">
      <h2>🔍 Buscar en Documentos</h2>
      
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu búsqueda..."
          disabled={isSearching || rateLimit.isLimited}
          className={rateLimit.isLimited ? 'disabled-input' : ''}
        />
        <button 
          onClick={handleSearch} 
          disabled={isSearching || rateLimit.isLimited}
          className={rateLimit.isLimited ? 'disabled-button' : ''}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {results.length > 0 ? (
        <div className="results">
          <h3>Resultados encontrados: {results.length}</h3>
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <span className="document-name">{result.document_name}</span>
              </div>
              <p className="result-text">{result.text}</p>
            </div>
          ))}
        </div>
      ) : (
        hasSearched && !isSearching && query && !rateLimit.isLimited && (
          <div className="no-results">
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        )
      )}

      {isSearching && (
        <div className="loading">
          <p>Buscando...</p>
        </div>
      )}

      <RateLimitNotification
        isVisible={rateLimit.isLimited}
        message={rateLimit.message}
        retryAfter={rateLimit.retryAfter}
        onClose={resetRateLimit}
      />
    </div>
  );
};

export default Search;