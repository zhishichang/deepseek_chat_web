import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';

export default function useConversations() {
  const conversations = useLiveQuery(
    () => db.conversations.orderBy('updatedAt').reverse().toArray(),
    []
  );

  const create = useCallback(async (model = 'deepseek-chat') => {
    const now = new Date().toISOString();
    const id = await db.conversations.add({
      title: '新对话',
      model,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }, []);

  const rename = useCallback(async (id, title) => {
    await db.conversations.update(id, { title, updatedAt: new Date().toISOString() });
  }, []);

  const remove = useCallback(async (id) => {
    await db.messages.where('conversationId').equals(id).delete();
    await db.conversations.delete(id);
  }, []);

  const updateModel = useCallback(async (id, model) => {
    await db.conversations.update(id, { model, updatedAt: new Date().toISOString() });
  }, []);

  const search = useCallback((query) => {
    if (!query) return conversations || [];
    const q = query.toLowerCase();
    return (conversations || []).filter((c) =>
      c.title.toLowerCase().includes(q)
    );
  }, [conversations]);

  return {
    conversations: conversations || [],
    create,
    rename,
    remove,
    updateModel,
    search,
    loading: conversations === undefined,
  };
}
