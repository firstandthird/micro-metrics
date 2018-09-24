
exports.aggregatecsv = {
  path: 'aggregate.csv',
  method: 'get',
  async handler(request, h) {
    const server = request.server;
    const aggregate = await server.req.get('/api/report/aggregate', { query: request.query });
    aggregate.forEach((record) => {
      delete record.date;
    });

    const csv = await server.methods.csv(aggregate, [
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
    ]);
    return h.response(csv).header('content-type', 'application/csv');
  }
};
