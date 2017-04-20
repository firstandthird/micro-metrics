'use strict';
exports.datatable = {
  path: 'datatable',
  method: 'get',
  handler: {
    autoInject: {
      results(server, request, done) {
        server.req.get('/api/report/aggregate', { query: request.query }, done);
      },
      table(results, done) {
        const out = results.map((item) => [item.createdOn, item.value]);
        done(null, out);
      },
      reply(table, done) {
        done(null, table);
      }
    }
  }
};
