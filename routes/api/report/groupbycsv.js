exports.groupbycsv = {
  path: 'groupby.csv',
  method: 'get',
  async handler(request, h) {
    const server = request.server;
    const groupby = await server.req.get('/api/report/groupby', { query: request.query });
    // dates in first column
    const columns = [{ label: 'Date', value: 'date' }];
    // each group by value as a column
    // Make sure to sort the group by values alphabetically so the csv stays with the same columns all the t
    const groupByValues = Object.keys(groupby).sort();
    groupByValues.forEach((key) => columns.push({ label: `${key[0].toUpperCase()}${key.substring(1)}`, value: key }));
    // get list length, assume same number of elements per term:
    let max = 0;
    groupByValues.forEach((key) => {
      if (groupby[key].length > max) {
        max = groupby[key].length;
      }
    });
    // use sum as the value for each row.
    const rows = [];
    for (let i = 0; i < max; i++) {
      const row = {};
      groupByValues.forEach((key) => {
        if (i >= groupby[key].length) {
          row[key] = 0;
          return;
        }
        const cell = groupby[key][i];
        const date = cell._id;
        row.date = `${date.day}/${date.month}/${date.year}`;
        row[key] = cell.sum;
      });
      rows.push(row);
    }
    const csv = await server.methods.csv(rows, columns);
    return h.response(csv).header('content-type', 'application/csv');
  }
};
