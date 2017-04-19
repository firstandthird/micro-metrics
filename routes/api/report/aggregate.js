const _ = require('lodash');
exports.aggregate = {
  path: 'aggregate',
  method: 'get',
  handler: {
    autoInject: {
      results(server, request, done) {
        server.req.get('/api/report', { query: request.query }, done);
      },
      aggregate(server, request, results, done) {
        const period = request.query.aggregate;
        const dataset = results.results;
        let grouped = _.groupBy(dataset, (item) => server.methods.processPeriod(item.createdOn, period));
        grouped = _.mapValues(grouped, (items) => _.sumBy(items, 'value'));
        const out = [];
        _.forIn(grouped, (value, date) => {
          out.push({
            createdOn: date,
            value
          });
        });
        done(null, out);
      },
      reply(aggregate, done) {
        done(null, aggregate);
      }
    }
  }
};
