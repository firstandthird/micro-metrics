'use strict';
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
          const aggMap = {
            '1h': 'm',
            '6h': 'h',
            '12h': 'h',
            '24h': 'h',
            '7d': 'd',
            '14d': 'd'
          };
          request.query.aggregate = aggMap[request.query.last] || 'h';
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
        { assign: 'tagValues', method: 'tag(query.tags)' },
        { assign: 'report', method: 'get(query)' }
      ]
    ]
  },
  handler(request, reply) {
    reply.view('report/view', {
      selectedType: request.query.type,
      types: request.pre.types,
      tags: request.pre.tags,
      tagValues: request.pre.tagValues,
      report: request.pre.report,
      current: {
        type: request.query.type,
        tags: request.query.tags,
        last: request.query.last
      }
    });
  }
};
