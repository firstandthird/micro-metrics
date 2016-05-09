'use strict';

exports.main = {
  method: 'GET',
  path: '/t.gif',
  handler: (request, reply) => {
    const payload = request.query;

    const data = request.server.methods.extractInfo(request);

    request.server.methods.track(payload, data);

    reply('').code(204);
  }
};
