import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../db', () => ({
  default: {
    messages: {
      add: vi.fn().mockResolvedValue(1),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      sortBy: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      delete: vi.fn(),
      bulkDelete: vi.fn(),
    },
    conversations: {
      get: vi.fn().mockResolvedValue({ model: 'deepseek-chat' }),
      update: vi.fn(),
    },
  },
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => []),
}));

vi.mock('./useSettings', () => ({
  default: vi.fn(() => ({
    settings: {
      defaultModel: 'deepseek-chat',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 2048,
      streamMode: true,
    },
  })),
}));

vi.mock('./useStreaming', () => ({
  default: vi.fn(() => ({
    startStream: vi.fn(),
    stopStream: vi.fn(),
  })),
}));

vi.mock('./useOnlineStatus', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../utils/offlineQueue', () => ({
  enqueue: vi.fn(),
  drain: vi.fn(() => []),
}));

const { default: useChat } = await import('./useChat.js');

describe('useChat', () => {
  it('returns expected interface', () => {
    const { result } = renderHook(() => useChat('conv-1'));

    expect(result.current).toHaveProperty('messages');
    expect(result.current).toHaveProperty('streamingContent');
    expect(result.current).toHaveProperty('streamingReasoning');
    expect(result.current).toHaveProperty('isGenerating');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('sendMessage');
    expect(result.current).toHaveProperty('stop');
    expect(result.current).toHaveProperty('regenerate');
    expect(result.current).toHaveProperty('retryLast');
    expect(result.current).toHaveProperty('editMessage');
    expect(result.current).toHaveProperty('deleteMessage');
    expect(result.current).toHaveProperty('online');
    expect(result.current).toHaveProperty('lastUsage');
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useChat('conv-1'));

    expect(result.current.messages).toEqual([]);
    expect(result.current.streamingContent).toBe('');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.online).toBe(true);
  });
});
