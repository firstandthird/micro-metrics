const emptyGifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

exports.main = {
  method: 'GET',
  path: '/t.gif',
  async handler(request, h) {
    const payload = request.query;
    payload.data = request.server.methods.extractInfo(request);
    try {
      await request.server.req.post('/api/track', { payload });
    } catch (err) {
      request.server.log(['error', 'tracking-gif'], { message: 'tracking failed for t.gif', err });
    }
    return h.response(emptyGifBuffer)
      .header('Content-Type', 'image/gif')
      .code(200);
  }
};

exports.c = {
  method: 'GET',
  path: '/c.gif',
  async handler(request, h) {
    const payload = request.query;
    payload.data = request.server.methods.extractInfo(request);
    try {
      await request.server.req.post('/api/conversion', { payload });
    } catch (err) {
      request.server.log(['error', 'tracking-gif'], { message: 'tracking failed for c.gif', err });
    }
    return h.response(emptyGifBuffer)
      .header('Content-Type', 'image/gif')
      .code(200);
  }
};
