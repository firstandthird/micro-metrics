'use strict';

exports.main = {
  method: 'GET',
  path: '/r/',
  handler: (request, reply) => {
    const payload = request.query;
    const to = payload.to;

    if (!to) {
      return reply({ err: 'must provide a location to redirect' });
    }

    delete payload.to;

    payload.data = request.server.methods.extractInfo(request);
    request.server.req.post('/api/track', { payload }, (err, result) => {
      if (err === null) {
        return reply.redirect(to);
      }
      reply(err);
    });
  }
};
