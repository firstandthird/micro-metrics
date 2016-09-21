'use strict';

exports.tag = {
  method: 'GET',
  path: '/api/tag/{tagKey}',
  handler(request, reply) {
    const filter = {};
    filter[`tags.${request.params.tagKey}`] = { '$exists': 1 };
    request.server.methods.tag(filter, (err, results) => {
      if (err) {
        return reply('Error').code(500);
      }
      reply(results);
    });
  }
};
