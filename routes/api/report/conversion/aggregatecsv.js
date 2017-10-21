exports.aggregatecsv = {
  path: '/api/report/conversion/aggregate.csv',
  method: 'get',
  handler: {
    autoInject: {
      report(server, request, done) {
        server.req.get('/api/report/conversion/aggregate', { query: request.query }, done);
      },
      csv(server, report, done) {
        const headers = [{
          Label: 'Option',
          value: 'option'
        },
        {
          Label: 'Success',
          value: 'success'
        },
        {
          Label: 'Impression',
          value: 'impression'
        }];
        return done(null, server.methods.csv(report, headers));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};
