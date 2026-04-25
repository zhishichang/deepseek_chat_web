import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout';
import useSettings from './hooks/useSettings';
import './db';

export default function App() {
  const { settings, set } = useSettings();
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
      <Layout onToggleTheme={handleToggle} themeMode={mode} />
    </ThemeProvider>
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
