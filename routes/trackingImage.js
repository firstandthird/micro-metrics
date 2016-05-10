'use strict';

exports.main = {
  method: 'GET',
  path: '/t.gif',
  handler: (request, reply) => {
    const payload = request.query;

    const data = request.server.methods.extractInfo(request);
    payload.data = data;
    request.server.methods.track(payload);

    reply('').header('Content-Type', 'image/gif').code(204);
  }
};
