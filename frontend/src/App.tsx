import React from 'react';
import Layout from './components/Layout';
import './styles/App.css';
import './styles/Layout.css';
import './styles/FileUpload.css';
import './styles/Search.css';
import './styles/Ask.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Layout />
    </div>
  );
};

export default App;