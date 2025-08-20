import React, { useState } from 'react';
import { apiService } from '../services/api';
import { SearchResult } from '../types';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const searchResults = await apiService.search(query);
      setResults(searchResults);
    } catch (error) {
      setError('Error en la búsqueda. Intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (hasSearched) {
      setHasSearched(false);
      setResults([]);
    }
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
          disabled={isSearching}
        />
        <button 
          onClick={handleSearch} 
          disabled={isSearching}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

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
        // Solo mostrar "no results" si ya se hizo una búsqueda
        hasSearched && !isSearching && query && (
          <div className="no-results">
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        )
      )}

      {isSearching && (
        <div className="loading">Buscando...</div>
      )}
    </div>
  );
};

export default Search;