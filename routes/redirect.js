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
    request.server.methods.track(payload);

    reply.redirect(to);
  }
};
