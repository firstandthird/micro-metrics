exports.count = {
  path: '/api/report/count',
  method: 'GET',
  async handler(request, h) {
    const count = await request.server.db.tracks.count(request.server.methods.getReportQuery(request.query));
    return { count };
  }
};
