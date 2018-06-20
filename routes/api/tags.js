exports.tags = {
  method: 'GET',
  path: '/api/tags',
  async handler(request, h) {
    const server = request.server;
    const filter = {};
    if (request.query && request.query.type) {
      filter.type = request.query.type;
    }
    // results will be an object in which the keys are the tag names
    // and the values are each a list of the values for those names;
    // eg: { 'currency': ['dollars', 'yen'], 'vegetable': 'carrot']}
    return server.db.tracks.distinct('tagKeys', filter);
  }
};
