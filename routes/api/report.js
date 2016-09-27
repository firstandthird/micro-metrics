'use strict';

exports.report = {
  method: 'GET',
  path: '/api/report',
  handler(request, reply) {
    const query = request.query;
    request.server.methods.get(query, (err, results) => {
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
