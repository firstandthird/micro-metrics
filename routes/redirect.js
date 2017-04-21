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
    request.server.inject({
      method: 'POST',
      url: '/api/track',
      payload
    }, (response) => {
      if (response.statusCode === 200) {
        return reply.redirect(to);
      }
      return reply({ statusCode: response.statusCode, message: response.statusMessage });
    });
  }
};
