exports.reportscsv = {
  path: '/api/report.csv',
  method: 'GET',
  handler: {
    autoInject: {
      report(server, request, done) {
        server.req.get('/api/report', { query: request.query }, done);
      },
      csv(server, report, done) {
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
        return done(null, server.methods.csv(find));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};
