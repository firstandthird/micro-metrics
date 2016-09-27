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
    reply.view('report/view', {
      selectedType: request.query.type,
      types: request.pre.types,
      tags: request.pre.tags,
      report: request.pre.report,
      current: {
        type: request.query.type,
        tags: request.query.tags,
        last: request.query.last
      }
    });
  }
};
