const _ = require('lodash');
exports.report = {
  path: '/ui',
  method: 'get',
  config: {
    pre: [
      {
        method: (request, reply) => {
          if (!request.query.last) {
            request.query.last = '24h';
          }
          reply();
        }
      },
      [
        { assign: 'types', method: 'types()' },
        { assign: 'tags', method: (request, reply) => {
          if (!request.query.type) {
            return reply(null, []);
          }
          request.server.methods.tags({ type: request.query.type }, reply);
        } },
        { assign: 'report', method: 'get(query)' }
      ]
    ]
  },
  handler(request, reply) {
    const report = [];
    const legend = [];
    //if tag is set, then graph by values
    if (request.query.tag) {
      const grouped = _.groupBy(request.pre.report, `tags.${request.query.tag}`);
      Object.keys(grouped).forEach((key) => {
        legend.push(key);
        report.push(grouped[key]);
      });
    } else {
      report.push(request.pre.report);
      legend.push(request.query.type);
    }
    reply.view('report/view', {
      selectedType: request.query.type,
      types: request.pre.types,
      tags: request.pre.tags,
      report,
      legend,
      current: {
        type: request.query.type,
        tag: request.query.tag,
        last: request.query.last
      }
    });
  }
};
