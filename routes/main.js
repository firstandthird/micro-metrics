exports.main = {
  method: 'GET',
  path: '/',
  handler: (request, h) => h.response('Hello').type('text/plain')
};
