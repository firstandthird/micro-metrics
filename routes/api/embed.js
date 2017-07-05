exports.embed = {
  path: '/embed',
  method: 'get',
  handler: {
    autoInject: {
      types(server, done) {
        server.req.get('/api/types', {}, done);
      },
      tags(server, request, done) {
        const type = request.query.type;
        server.req.get('/api/tags', { query: { type } }, done);
      },
      tagValues(server, request, done) {
        if (!request.query.tag) {
          return done(null, []);
        }
        server.req.get('/api/tag-values', { query: { tag: request.query.tag } }, done);
      },
      aggregate(server, request, done) {
        const query = {};
        if (request.query.type) {
          query.type = request.query.type;
        }
        if (request.query.period) {
          query.period = request.query.period;
        }
        if (request.query.tag) {
          query.tags = request.query.tag;
        }
        server.req.get('/api/report/aggregate', { query }, done);
      },
      html(settings, aggregate, types, tags, tagValues, request, done) {
        const prefix = settings.routePrefix;
        const currentChart = request.query.chart || 'LineChart';
        const currentType = request.query.type;
        const currentTag = request.query.tag;
        const currentTagValue = request.query.tagValue;
        const currentPeriod = request.query.period;
        const html = `
          <html>
            <head>
              ${request.query.refresh ? `<meta http-equiv="refresh" content="${request.query.refresh}">` : ''}
              <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
              <script type="text/javascript">
                google.charts.load('current', {'packages':['table', 'corechart']});
                google.charts.setOnLoadCallback(drawTable);

                function drawTable() {
                  var data = new google.visualization.DataTable();
                  data.addColumn('datetime', 'Date');
                  data.addColumn('number', 'Count');
                  data.addRows([
                    ${aggregate.map((item) => `[new Date(${item.date}), ${item.sum}]`).join(',')}
                  ]);

                  var table = new google.visualization.${currentChart}(document.getElementById('chart'));

                  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
                }
              </script>
            </head>
            <body>
              <form action="${prefix}/embed" method="get" ${request.query.toolbar === '0' ? 'style="display: none"' : ''}>
                <select name="chart">
                  <option value="LineChart" ${currentChart === 'LineChart' ? 'selected' : ''}>Line Chart</option>
                  <option value="Table" ${currentChart === 'Table' ? 'selected' : ''}>Table</option>
                </select>
                <select name="period">
                  <option value="">Period</option>
                  <option value="m" ${currentPeriod === 'm' ? 'selected' : ''}>Minute</option>
                  <option value="h" ${currentPeriod === 'h' ? 'selected' : ''}>Hour</option>
                  <option value="d" ${currentPeriod === 'd' ? 'selected' : ''}>Day</option>
                </section>
                </select>
                <select name="type">
                  <option value="">Type</option>
                  ${types.results.map((type) => `<option value="${type}" ${(currentType === type) ? 'selected' : ''}>${type}</option>`).join('')}
                </select>
                <select name="tag">
                  <option value="">Tag</option>
                  ${tags.map((tag) => `<option value="${tag}" ${(currentTag === tag) ? 'selected' : ''}>${tag}</option>`).join('')}
                </select>
                <select name="tagValue">
                  <option value="">Tag Values</option>
                  ${tagValues.map((value) => `<option value="${value}" ${(currentTagValue === value) ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
                <input type="submit" value="Query"/>
              </form>
              <div id="chart"></div>
            </body>
          </html>
        `;
        done(null, html);
      },
      reply(html, aggregate, request, done) {
        if (request.query.raw === '1') {
          return done(null, aggregate);
        }
        done(null, html);
      }
    }
  }
};
