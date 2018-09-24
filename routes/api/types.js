exports.types = {
  method: 'GET',
  path: '/api/types',
  async handler(request, h) {
    const server = request.server;
    const types = await server.db.tracks.distinct('type');
    return { count: types.length, results: types };
  }
};
