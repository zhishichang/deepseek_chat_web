import { Router } from 'express';
import { encode } from 'gpt-tokenizer';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    throw new ApiError(400, 'validation', 'messages must be an array');
  }

  let total = 0;
  for (const msg of messages) {
    // ~4 tokens overhead per message for role/formatting
    total += encode(typeof msg.content === 'string' ? msg.content : '').length + 4;
  }

  res.json({ token_count: total });
});

export default router;
