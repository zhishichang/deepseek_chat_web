let activeStream = null;

export function requestLock(req, res, next) {
  if (activeStream) {
    activeStream.abortController.abort();
    activeStream.res.end();
  }

  req.abortController = new AbortController();
  activeStream = { abortController: req.abortController, res };

  res.on('close', () => {
    if (activeStream?.res === res) {
      activeStream = null;
    }
  });

  next();
}
