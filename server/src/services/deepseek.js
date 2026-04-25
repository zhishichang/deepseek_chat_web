import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '../config.js';

export async function createChatCompletion(body) {
  const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}
