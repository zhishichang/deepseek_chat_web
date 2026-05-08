import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db', () => {
  const mockConversations = { get: vi.fn() };
  const mockMessages = {
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    sortBy: vi.fn(),
  };
  return {
    default: {
      conversations: mockConversations,
      messages: mockMessages,
    },
  };
});

const { exportAsMarkdown, exportAsJSON, downloadFile } = await import('./export.js');
const { default: db } = await import('../db');

describe('exportAsMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates markdown with conversation title', async () => {
    db.conversations.get.mockResolvedValue({ title: 'Test Chat', model: 'deepseek-chat', createdAt: '2024-01-01' });
    db.messages.sortBy.mockResolvedValue([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);

    const result = await exportAsMarkdown('conv-1');

    expect(result).toContain('# Test Chat');
    expect(result).toContain('deepseek-chat');
    expect(result).toContain('**用户**');
    expect(result).toContain('Hello');
    expect(result).toContain('**助手**');
    expect(result).toContain('Hi there');
  });

  it('uses default title when conversation not found', async () => {
    db.conversations.get.mockResolvedValue(undefined);
    db.messages.sortBy.mockResolvedValue([]);

    const result = await exportAsMarkdown('conv-1');

    expect(result).toContain('# 对话');
  });
});

describe('exportAsJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns valid JSON with conversation and messages', async () => {
    const conv = { id: 1, title: 'Test' };
    const msgs = [{ id: 1, content: 'Hello' }];
    db.conversations.get.mockResolvedValue(conv);
    db.messages.sortBy.mockResolvedValue(msgs);

    const result = await exportAsJSON('conv-1');
    const parsed = JSON.parse(result);

    expect(parsed.conversation).toEqual(conv);
    expect(parsed.messages).toEqual(msgs);
  });
});

describe('downloadFile', () => {
  it('creates a download link and clicks it', () => {
    const mockClick = vi.fn();
    const mockLink = { href: '', download: '', click: mockClick };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL');

    downloadFile('test content', 'test.md', 'text/markdown');

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('test.md');
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
