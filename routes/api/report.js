'use strict';

exports.report = {
  method: 'GET',
  path: '/api/report',
  handler(request, reply) {
    const query = request.query;
    if (request.query.last) {
      query.startDate = request.server.methods.extractStartDate(request.query.last);
      query.endDate = new Date().getTime();
      delete query.last;
    }
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
