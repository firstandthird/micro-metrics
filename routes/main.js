exports.main = {
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('Hello').type('text/plain');
  }
};
