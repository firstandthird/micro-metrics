'use strict';

const emptyGifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

exports.main = {
  method: 'GET',
  path: '/t.gif',
  handler: (request, reply) => {
    const payload = request.query;
    const data = request.server.methods.extractInfo(request);
    payload.data = data;
    request.server.req.post('/api/track', { payload }, (response) => {
      reply(emptyGifBuffer)
        .header('Content-Type', 'image/gif')
        .code(200);
    });
  }
};
