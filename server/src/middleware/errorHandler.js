export function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message);

  if (err.name === 'AbortError') {
    return res.status(499).json({ error: 'aborted', message: 'Request was aborted' });
  }

  const status = err.status || 500;
  const type = err.type || 'server';

  const body = {
    error: type,
    message: err.message || 'Internal server error',
  };

  if (err.retryAfter) {
    body.retryAfter = err.retryAfter;
  }

  res.status(status).json(body);
}

export class ApiError extends Error {
  constructor(status, type, message, retryAfter) {
    super(message);
    this.status = status;
    this.type = type;
    this.retryAfter = retryAfter;
  }
}
