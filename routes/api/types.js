'use strict';

exports.types = {
  method: 'GET',
  path: '/api/types',
  handler(request, reply) {
    request.server.methods.types((err, results) => {
      reply({
        count: results.length,
        results
      });
    });
  }
};
