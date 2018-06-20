'use strict';

exports.main = {
  method: 'GET',
  path: '/r/',
  async handler(request, h) {
    const payload = request.query;
    const to = payload.to;

    if (!to) {
      return { err: 'must provide a location to redirect' };
    }

    delete payload.to;

    payload.data = request.server.methods.extractInfo(request);
    await request.server.req.post('/api/track', { payload });
    return h.redirect(to);
  }
};
