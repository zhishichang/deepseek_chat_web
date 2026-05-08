import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockConversations = {
  orderBy: vi.fn().mockReturnThis(),
  reverse: vi.fn().mockReturnThis(),
  toArray: vi.fn().mockResolvedValue([]),
  add: vi.fn().mockResolvedValue(1),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};
const mockMessages = {
  where: vi.fn().mockReturnThis(),
  equals: vi.fn().mockReturnThis(),
  delete: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../db', () => ({
  default: {
    conversations: mockConversations,
    messages: mockMessages,
  },
}));

const mockUseLiveQuery = vi.fn((queryFn) => queryFn());
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args) => mockUseLiveQuery(...args),
}));

const { default: useConversations } = await import('./useConversations.js');

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversations.toArray.mockResolvedValue([]);
    mockUseLiveQuery.mockImplementation((queryFn) => queryFn());
  });

  it('returns conversations and CRUD functions', () => {
    const { result } = renderHook(() => useConversations());

    expect(result.current).toHaveProperty('conversations');
    expect(result.current).toHaveProperty('create');
    expect(result.current).toHaveProperty('rename');
    expect(result.current).toHaveProperty('remove');
    expect(result.current).toHaveProperty('updateModel');
    expect(result.current).toHaveProperty('search');
    expect(result.current).toHaveProperty('loading');
  });

  it('create adds a new conversation', async () => {
    const { result } = renderHook(() => useConversations());

    await act(async () => {
      await result.current.create('deepseek-chat');
    });

    expect(mockConversations.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '新对话',
        model: 'deepseek-chat',
      })
    );
  });

  it('rename updates conversation title', async () => {
    const { result } = renderHook(() => useConversations());

    await act(async () => {
      await result.current.rename(1, 'New Title');
    });

    expect(mockConversations.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ title: 'New Title' })
    );
  });

  it('remove deletes messages and conversation', async () => {
    const { result } = renderHook(() => useConversations());

    await act(async () => {
      await result.current.remove(1);
    });

    expect(mockMessages.where).toHaveBeenCalledWith('conversationId');
    expect(mockConversations.delete).toHaveBeenCalledWith(1);
  });

  it('updateModel updates conversation model', async () => {
    const { result } = renderHook(() => useConversations());

    await act(async () => {
      await result.current.updateModel(1, 'deepseek-reasoner');
    });

    expect(mockConversations.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ model: 'deepseek-reasoner' })
    );
  });

  it('search filters conversations by query', () => {
    const mockConvs = [
      { title: 'Hello World' },
      { title: 'Test Chat' },
      { title: 'Hello Again' },
    ];
    mockUseLiveQuery.mockReturnValue(mockConvs);

    const { result } = renderHook(() => useConversations());
    const filtered = result.current.search('hello');

    expect(filtered).toHaveLength(2);
  });

  it('search returns all when query is empty', () => {
    const mockConvs = [{ title: 'A' }, { title: 'B' }];
    mockUseLiveQuery.mockReturnValue(mockConvs);

    const { result } = renderHook(() => useConversations());
    const filtered = result.current.search('');

    expect(filtered).toHaveLength(2);
  });
});
