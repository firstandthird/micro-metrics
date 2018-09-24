exports.reportcsv = {
  path: '/api/report/conversion.csv',
  method: 'get',
  handler: async (request, h) => {
    const server = request.server;
    const report = await server.req.get('/api/report/conversion', { query: request.query });
    const headerObj = {};
    report.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!headerObj[key]) {
          headerObj[key] = key;
        }
      });
    });
    delete headerObj.date;
    delete headerObj.dateString;
    const headers = [{
      Label: 'Date',
      value: 'dateString'
    }];
    Object.keys(headerObj).forEach((header) => {
      headers.push({
        Label: header[0].toUpperCase() + header.substring(1),
        value: header
      });
    });
    const csv = server.methods.csv(report, headers);
    return h.response(csv).header('content-type', 'application/csv');
  }
};
