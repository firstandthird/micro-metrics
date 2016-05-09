

exports.main = {
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    request.server.methods.track({}, (err) => {
      reply('Hello');
    });
  }
};
