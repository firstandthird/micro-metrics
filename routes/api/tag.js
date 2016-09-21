'use strict';

exports.tag = {
  method: 'GET',
  path: '/api/tag-values',
  handler(request, reply) {
    const filter = {};
    filter[`tags.${request.query.tag}`] = { '$exists': 1 };
    if (request.query.type) {
      filter.type = request.query.type;
    }
    request.server.methods.tag(request.query.tag, filter, (err, results) => {
      if (err) {
        return reply('Error').code(500);
      }
      reply(results);
    });
  }
};
