'use strict';

const emptyGifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

exports.main = {
  method: 'GET',
  path: '/t.gif',
  handler: (request, reply) => {
    const payload = request.query;
    payload.data = request.server.methods.extractInfo(request);
    request.server.req.post('/api/track', { payload }, (err, response) => {
      if (err) {
        request.server.log(['error', 'tracking-gif'], { message: 'tracking failed for t.gif', err });
      }
      reply(emptyGifBuffer)
        .header('Content-Type', 'image/gif')
        .code(200);
    });
  }
};

exports.c = {
  method: 'GET',
  path: '/c.gif',
  handler: (request, reply) => {
    const payload = request.query;
    payload.data = request.server.methods.extractInfo(request);
    request.server.req.post('/api/conversion', { payload }, (err, response) => {
      if (err) {
        request.server.log(['error', 'tracking-gif'], { message: 'tracking failed for c.gif', err });
      }
      reply(emptyGifBuffer)
        .header('Content-Type', 'image/gif')
        .code(200);
    });
  }
};
