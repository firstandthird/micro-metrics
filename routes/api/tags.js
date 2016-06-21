'use strict';

exports.tags = {
  method: 'GET',
  path: '/api/tags/{type?}',
  handler(request, reply) {
    request.server.methods.tags(request.params, (err, results) => {
      reply({
        count: results.length,
        results
      });
    });
  }
};
