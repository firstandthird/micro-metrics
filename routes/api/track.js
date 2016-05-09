'use-strict';

exports.track = {
  method: 'POST',
  path: '/api/track',
  handler: (request, reply) => {
    request.server.methods.track(request.payload, (err, data) => {
      if (err) {
        return reply(err);
      }

      reply(data);
    });
  }
};
