import React, { useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { HistoryPage } from './pages/HistoryPage';
import { CredentialsPanel } from './components/CredentialsPanel';
import './App.css';

type View = 'editor' | 'history' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('editor');

  return (
    <>
      {view === 'editor' && (
        <EditorPage onViewHistory={() => setView('history')} onViewSettings={() => setView('settings')} />
      )}
      {view === 'history' && (
        <HistoryPage onBack={() => setView('editor')} />
      )}
      {view === 'settings' && (
        <div className="settings-page">
          <header className="app-header">
            <button className="btn-back" onClick={() => setView('editor')}>← 返回</button>
            <h1>设置</h1>
          </header>
          <div className="settings-content">
            <CredentialsPanel />
          </div>
        </div>
      )}
    </>
  );
}
