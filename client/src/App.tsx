import React, { useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { HistoryPage } from './pages/HistoryPage';
import './App.css';

export default function App() {
  const [view, setView] = useState<'editor' | 'history'>('editor');

  return (
    <>
      {view === 'editor' && (
        <EditorPage onViewHistory={() => setView('history')} />
      )}
      {view === 'history' && (
        <HistoryPage onBack={() => setView('editor')} />
      )}
    </>
  );
}
