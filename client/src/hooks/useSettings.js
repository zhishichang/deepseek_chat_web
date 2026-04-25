import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';

const DEFAULTS = {
  defaultModel: 'deepseek-chat',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 4096,
  streamMode: true,
  theme: 'system',
  maxContextTokens: 65536,
};

export default function useSettings() {
  const settings = useLiveQuery(async () => {
    const rows = await db.settings.toArray();
    const obj = {};
    for (const row of rows) {
      obj[row.key] = row.value;
    }
    return obj;
  });

  const get = useCallback((key) => {
    return settings?.[key] ?? DEFAULTS[key];
  }, [settings]);

  const set = useCallback(async (key, value) => {
    await db.settings.put({ key, value });
  }, []);

  const reset = useCallback(async () => {
    await db.settings.clear();
    for (const [key, value] of Object.entries(DEFAULTS)) {
      await db.settings.put({ key, value });
    }
  }, []);

  return {
    settings: settings ? { ...DEFAULTS, ...settings } : { ...DEFAULTS },
    get,
    set,
    reset,
    loading: settings === undefined,
  };
}
