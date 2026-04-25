const QUEUE_KEY = 'offlineQueue';

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(queue) {
  sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(conversationId, content) {
  const queue = load();
  queue.push({ conversationId, content, queuedAt: Date.now() });
  save(queue);
}

export function drain() {
  const queue = load();
  sessionStorage.removeItem(QUEUE_KEY);
  return queue;
}

export function peek() {
  return load();
}
