'use strict';

exports.track = {
  method: 'POST',
  path: '/api/track',
  handler: (request, reply) => {
    if (request.payload.data && request.payload.data.ttl) {
      request.payload.expiresOn = new Date(new Date().getTime() + request.payload.data.ttl);
      delete request.payload.data.ttl;
    }
    request.server.methods.track(request.payload, (err, data) => {
      if (err) {
        return reply(err);
      }
      reply(data);
    });
  }
};
