import Dexie from 'dexie';

const db = new Dexie('deepseek-chat');

db.version(1).stores({
  conversations: '++id, title, model, createdAt, updatedAt',
  messages: '++id, conversationId, role, createdAt, [conversationId+createdAt]',
  settings: 'key',
});

export default db;
