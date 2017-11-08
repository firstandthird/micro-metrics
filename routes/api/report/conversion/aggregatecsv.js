exports.aggregatecsv = {
  path: '/api/report/conversion/aggregate.csv',
  method: 'get',
  handler: {
    autoInject: {
      report(server, request, done) {
        server.req.get('/api/report/conversion/aggregate', { query: request.query }, done);
      },
      csv(server, report, done) {
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
        return done(null, server.methods.csv(report, headers));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};
