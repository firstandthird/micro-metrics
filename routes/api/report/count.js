'use strict';
exports.count = {
  path: '/api/report/count',
  method: 'GET',
  handler(request, reply) {
    request.server.db.tracks.count(request.query, (err, count) => {
      if (err) {
        return reply(err);
      }
      return reply(null, { count });
    });
  }
};
