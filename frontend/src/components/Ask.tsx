import React, { useState } from 'react';
import { apiService } from '../services/api';
import { AskResponse } from '../types';

const Ask: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Por favor ingresa una pregunta');
      return;
    }

    setIsAsking(true);
    setError('');
    setAnswer(null);

    try {
      const response = await apiService.ask(question);
      setAnswer(response);
    } catch (error) {
      setError('Error al procesar la pregunta. Intenta nuevamente.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="ask">
      <h2>❓ Hacer Pregunta</h2>
      
      <div className="ask-box">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu pregunta en lenguaje natural..."
          rows={3}
          disabled={isAsking}
        />
        <button 
          onClick={handleAsk} 
          disabled={isAsking}
        >
          {isAsking ? 'Pensando...' : 'Preguntar'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {answer && (
        <div className="answer">
          <h3>Respuesta:</h3>
          <div className="answer-text">{answer.answer}</div>
          
          {answer.citations.length > 0 && (
            <div className="citations">
              <h4>📚 Fuentes:</h4>
              <ul>
                {answer.citations.map((citation, index) => (
                  <li key={index} className="citation-item">
                    {citation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {isAsking && (
        <div className="loading">Pensando...</div>
      )}
    </div>
  );
};

export default Ask;