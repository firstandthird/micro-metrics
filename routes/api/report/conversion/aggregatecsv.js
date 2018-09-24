exports.aggregatecsv = {
  path: '/api/report/conversion/aggregate.csv',
  method: 'get',
  handler: async (request, h) => {
    const server = request.server;
    const report = await server.req.get('/api/report/conversion/aggregate', { query: request.query });
    const seen = [];
    const headers = [];
    report.forEach((header) => {
      Object.keys(header).forEach((eventName) => {
        if (seen.indexOf(eventName) === -1) {
          seen.push(eventName);
          headers.push({
            Label: eventName.charAt(0).toUpperCase() + eventName.slice(1),
            value: eventName
          });
        }
      });
    });
    const csv = server.methods.csv(report, headers);
    return h.response(csv).header('content-type', 'application/csv');
  }
};
