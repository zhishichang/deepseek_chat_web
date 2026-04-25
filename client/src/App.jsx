import { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout';
import useSettings from './hooks/useSettings';
import useConversations from './hooks/useConversations';
import './db';

export default function App() {
  const { settings, set } = useSettings();
  const conversationsState = useConversations();
  const mode = settings.theme;

  const prefersDark = usePrefersDark();
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    set('theme', next);
  };

  if (settings === undefined) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent
          onToggleTheme={handleToggle}
          themeMode={mode}
          conversationsState={conversationsState}
          defaultModel={settings.defaultModel}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function AppContent({ onToggleTheme, themeMode, conversationsState, defaultModel }) {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const activeId = conversationId ? Number(conversationId) : null;

  const handleNewConversation = useCallback(async () => {
    const id = await conversationsState.create(defaultModel);
    navigate(`/c/${id}`);
  }, [conversationsState, defaultModel, navigate]);

  const handleSelectConversation = useCallback((id) => {
    navigate(`/c/${id}`);
  }, [navigate]);

  const handleDeleteConversation = useCallback(async (id) => {
    await conversationsState.remove(id);
    if (activeId === id) navigate('/');
  }, [conversationsState, activeId, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            onToggleTheme={onToggleTheme}
            themeMode={themeMode}
            conversations={conversationsState.conversations}
            activeId={null}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onRenameConversation={conversationsState.rename}
            onDeleteConversation={handleDeleteConversation}
          />
        }
      />
      <Route
        path="/c/:conversationId"
        element={
          <Layout
            onToggleTheme={onToggleTheme}
            themeMode={themeMode}
            conversations={conversationsState.conversations}
            activeId={activeId}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onRenameConversation={conversationsState.rename}
            onDeleteConversation={handleDeleteConversation}
          />
        }
      />
    </Routes>
  );
}

function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersDark;
}
