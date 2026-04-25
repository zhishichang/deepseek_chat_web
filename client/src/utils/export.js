import db from '../db';

export async function exportAsMarkdown(conversationId) {
  const conversation = await db.conversations.get(conversationId);
  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt');

  const lines = [
    `# ${conversation?.title || '对话'}`,
    '',
    `> 模型: ${conversation?.model || 'unknown'}`,
    `> 创建时间: ${conversation?.createdAt || ''}`,
    '',
    '---',
    '',
  ];

  for (const msg of messages) {
    const role = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? '助手' : msg.role;
    lines.push(`**${role}**\n`);
    lines.push(msg.content);
    lines.push('\n---\n');
  }

  return lines.join('\n');
}

export async function exportAsJSON(conversationId) {
  const conversation = await db.conversations.get(conversationId);
  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt');

  return JSON.stringify({ conversation, messages }, null, 2);
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
