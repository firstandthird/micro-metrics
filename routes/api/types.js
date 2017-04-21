'use strict';

exports.types = {
  method: 'GET',
  path: '/api/types',
  handler(request, reply) {
    request.server.methods.types((err, results) => {
      if (err) {
        return reply(err);
      }
      reply({
        count: results.length,
        results
      });
    });
  }
};
