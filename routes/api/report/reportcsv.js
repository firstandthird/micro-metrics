exports.reportscsv = {
  path: '/api/report.csv',
  method: 'GET',
  handler: async (request, h) => {
    const server = request.server;
    const report = await server.req.get('/api/report', { query: request.query });
    const find = report.results;
    find.forEach((record) => {
      delete record._id; // eslint-disable-line no-underscore-dangle
      record.createdOn = new Date(record.createdOn).toISOString();
      if (typeof record.fields === 'object') {
        record.fields = JSON.stringify(record.fields).replace('{', '').replace('}', '');
      }
      if (Array.isArray(record.tagKeys)) {
        record.tagKeys = record.tagKeys.join(',');
      }
    });
    const csv = await server.methods.csv(find);
    return h.response(csv).header('content-type', 'application/csv');
  }
};
