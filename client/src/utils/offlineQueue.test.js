import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock sessionStorage
const storage = {};
const mockSessionStorage = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, value) => { storage[key] = value; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
};
vi.stubGlobal('sessionStorage', mockSessionStorage);

const { enqueue, drain, peek } = await import('./offlineQueue.js');

describe('offlineQueue', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) delete storage[key];
    vi.clearAllMocks();
  });

  it('enqueue adds item to queue', () => {
    enqueue('conv-1', 'hello');

    expect(mockSessionStorage.setItem).toHaveBeenCalled();
    const saved = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].conversationId).toBe('conv-1');
    expect(saved[0].content).toBe('hello');
    expect(saved[0].queuedAt).toBeDefined();
  });

  it('enqueue appends to existing queue', () => {
    enqueue('conv-1', 'first');
    enqueue('conv-1', 'second');

    const lastCall = mockSessionStorage.setItem.mock.calls.at(-1)[1];
    const saved = JSON.parse(lastCall);
    expect(saved).toHaveLength(2);
  });

  it('drain returns all items and clears queue', () => {
    enqueue('conv-1', 'msg1');
    enqueue('conv-1', 'msg2');

    const result = drain();

    expect(result).toHaveLength(2);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('offlineQueue');
  });

  it('peek returns items without clearing', () => {
    enqueue('conv-1', 'msg1');

    const result = peek();

    expect(result).toHaveLength(1);
    expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
  });

  it('returns empty array when queue is empty', () => {
    const result = peek();
    expect(result).toEqual([]);
  });
});
