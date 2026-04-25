import { Router } from 'express';
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '../config.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

let cachedModels = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchModels() {
  const now = Date.now();
  if (cachedModels && now - cacheTimestamp < CACHE_TTL) {
    return cachedModels;
  }

  const response = await fetch(`${DEEPSEEK_API_URL}/models`, {
    headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'upstream', 'Failed to fetch models from DeepSeek API');
  }

  const data = await response.json();
  cachedModels = data;
  cacheTimestamp = now;
  return data;
}

router.get('/', async (req, res) => {
  const data = await fetchModels();
  res.json(data);
});

export default router;
