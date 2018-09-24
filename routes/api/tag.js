'use strict';

exports.tag = {
  method: 'GET',
  path: '/api/tag-values',
  handler(request, h) {
    const filter = {};
    filter[`tags.${request.query.tag}`] = { $exists: 1 };
    if (request.query.type) {
      filter.type = request.query.type;
    }
    return request.server.methods.tag(request.query.tag, filter);
  }
};
