import { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout';
import useSettings from './hooks/useSettings';
import useConversations from './hooks/useConversations';
import useModels from './hooks/useModels';
import useOnlineStatus from './hooks/useOnlineStatus';
import { drain } from './utils/offlineQueue';
import db from './db';

export default function App() {
  const { settings, set } = useSettings();
  const conversationsState = useConversations();
  const modelsState = useModels();
  const mode = settings.theme;

  const prefersDark = usePrefersDark();
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const handleToggle = (mode) => {
    set('theme', mode || (isDark ? 'light' : 'dark'));
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
          modelsState={modelsState}
          defaultModel={settings.defaultModel}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function AppContent({ onToggleTheme, themeMode, conversationsState, modelsState, defaultModel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const online = useOnlineStatus();

  const match = location.pathname.match(/^\/c\/(\d+)$/);
  const activeId = match ? Number(match[1]) : null;

  const activeConversation = conversationsState.conversations.find((c) => c.id === activeId);
  const currentModel = activeConversation?.model || defaultModel;

  // Flush offline queue when coming back online
  useEffect(() => {
    if (!online) return;
    const queue = drain();
    if (queue.length === 0) return;

    for (const item of queue) {
      db.messages.add({
        conversationId: item.conversationId,
        role: 'user',
        content: item.content,
        reasoningContent: '',
        createdAt: new Date().toISOString(),
        tokenCount: 0,
        isEdited: false,
        originalContent: '',
      });
      db.conversations.update(item.conversationId, {
        updatedAt: new Date().toISOString(),
      });
    }
    // If the current view matches a queued conversation, navigate to trigger re-render
    const lastQueued = queue[queue.length - 1];
    if (lastQueued) {
      navigate(`/c/${lastQueued.conversationId}`, { replace: true });
    }
  }, [online, navigate]);

  const handleNewConversation = useCallback(async () => {
    const id = await conversationsState.create(currentModel || defaultModel);
    navigate(`/c/${id}`);
  }, [conversationsState, currentModel, defaultModel, navigate]);

  const handleSelectConversation = useCallback((id) => {
    navigate(`/c/${id}`);
  }, [navigate]);

  const handleDeleteConversation = useCallback(async (id) => {
    await conversationsState.remove(id);
    if (activeId === id) navigate('/');
  }, [conversationsState, activeId, navigate]);

  const handleModelChange = useCallback((model) => {
    if (activeId) {
      conversationsState.updateModel(activeId, model);
    }
  }, [activeId, conversationsState]);

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
      models={modelsState.models}
      currentModel={currentModel}
      onModelChange={handleModelChange}
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
