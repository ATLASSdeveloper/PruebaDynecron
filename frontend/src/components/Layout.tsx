import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Search from './Search';
import Ask from './Ask';

type Tab = 'upload' | 'search' | 'ask';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'upload', label: 'Subir Documentos', icon: '📁' },
    { id: 'search', label: 'Buscar', icon: '🔍' },
    { id: 'ask', label: 'Preguntar', icon: '❓' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 Asistente Q&A</h1>
        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'upload' && <FileUpload />}
        {activeTab === 'search' && <Search />}
        {activeTab === 'ask' && <Ask />}
      </main>

      <footer className="app-footer">
        <p>Procesamiento de documentos con IA</p>
      </footer>
    </div>
  );
};

export default Layout;