export function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message);

  if (err.name === 'AbortError') {
    return res.status(499).json({ error: 'aborted', message: 'Request was aborted' });
  }

  const status = err.status || 500;
  const type = err.type || 'server';
  res.status(status).json({
    error: type,
    message: err.message || 'Internal server error',
  });
}

export class ApiError extends Error {
  constructor(status, type, message) {
    super(message);
    this.status = status;
    this.type = type;
  }
}
