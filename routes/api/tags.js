'use strict';

exports.tags = {
  method: 'GET',
  path: '/api/tags',
  handler(request, reply) {
    const filter = {};
    if (request.query && request.query.type) {
      filter.type = request.query.type;
    }
    request.server.methods.tags(filter, (err, results) => {
      if (err) {
        request.server.log(err);
      }
      // results will be an object in which the keys are the tag names
      // and the values are each a list of the values for those names
      // eg: { 'currency': ['dollars', 'yen'], 'vegetable': 'carrot']}
      reply(results);
    });
  }
};
