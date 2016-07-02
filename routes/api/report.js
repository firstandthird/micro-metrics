'use strict';

exports.track = {
  method: 'GET',
  path: '/api/report',
  handler(request, reply) {
    request.server.methods.get(request.query, (err, results) => {
      reply({
        count: results.length,
        results
      });
    });
  }
};
