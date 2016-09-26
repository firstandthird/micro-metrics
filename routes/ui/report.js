exports.report = {
  path: '/ui',
  method: 'get',
  config: {
    pre: [
      [
        { assign: 'types', method: 'types()' },
        { assign: 'tags', method: 'tags(query)' },
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
        tag: request.query.tag
      }
    });
  }
};
