import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import chatRouter from './routes/chat.js';
import modelsRouter from './routes/models.js';
import tokensRouter from './routes/tokens.js';
import { PORT } from './config.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);
app.use('/api/count-tokens', tokensRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
