exports.reportcsv = {
  path: '/api/report/conversion.csv',
  method: 'get',
  handler: {
    autoInject: {
      report(server, request, done) {
        server.req.get('/api/report/conversion', { query: request.query }, done);
      },
      csv(server, report, done) {
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
        return done(null, server.methods.csv(report, headers));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};
