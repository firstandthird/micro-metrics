
exports.aggregatecsv = {
  path: 'aggregate.csv',
  method: 'get',
  handler: {
    autoInject: {
      aggregate(server, request, done) {
        server.req.get('/api/report/aggregate', { query: request.query }, done);
      },
      map(aggregate, done) {
        aggregate.forEach((record) => {
          delete record.date;
        });
        done(null, aggregate);
      },
      csv(server, aggregate, done) {
        return done(null, server.methods.csv(aggregate, [
          {
            label: 'Date',
            value: 'dateString'
          },
          {
            label: 'Sum',
            value: 'sum'
          },
          {
            label: 'Avg',
            value: 'avg'
          },
          {
            label: 'Max',
            value: 'max'
          },
          {
            label: 'Min',
            value: 'min'
          },
        ]));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};
