import { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Extract conversationId from URL path
  const match = location.pathname.match(/^\/c\/(\d+)$/);
  const activeId = match ? Number(match[1]) : null;

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
