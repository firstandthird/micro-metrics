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
      encode(aggregate, done) {
        const dates = aggregate.map(d => d.date);
        const values = aggregate.map(d => d.sum);

        // To UNIX TimeStamp
        const maxDate = Math.round((new Date(Math.max(...dates))).getTime() / 1000);
        const minDate = Math.round((new Date(Math.min(...dates))).getTime() / 1000);

        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const b62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const data = [];
        const r = Math.max(maxValue - minValue, 0);

        if (!r) {
          for (let i = 0; i < values.length; i++) {
            data.push(b62[0]);
          }
        } else {
          const length = b62.length - 1;
          for (let i = 0; i < values.length; i ++) {
            const y = values[i];
            const index = Math.trunc(length * (y - minValue) / r);
            const value = (index >= 0 && index < b62.length) ?
              b62[index] : b62[0];
            data.push(value);
          }
        }

        done(null, {
          date: {
            max: maxDate,
            min: minDate
          },
          values: {
            max: maxValue,
            min: minValue,
            string: data.join(''),
            raw: aggregate
          }
        });
      },
      options(request, done) {
        const chart = request.query.chart || 'LineChart';
        const type = request.query.type;
        const tag = request.query.tag;
        const tagValue = request.query.tagValue;
        const period = request.query.period;

        let title = '';

        if (type) {
          title = type;
        }

        if (tag || tagValue) {
          const values = [];

          if (tag) {
            values.push(tag);
          }

          if (tagValue) {
            values.push(tagValue);
          }

          title += ` [${values.join(':')}]`;
        }

        if (period) {
          const periods = {
            d: '30 days',
            h: 'day',
            m: 'hour'
          };

          title += ` (last ${periods[period]})`;
        }

        title = title.trim();

        done(null, {
          chart,
          type,
          tag,
          tagValue,
          period,
          title
        });
      },
      html(settings, encode, options, types, tags, tagValues, request, done) {
        const prefix = settings.routePrefix;
        let script = '';

        if (options.chart !== 'LineChart') {
          script = `
            <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
            <script type="text/javascript">
              google.charts.load('current', {'packages':['table', 'corechart']});
              google.charts.setOnLoadCallback(drawTable);

              function drawTable() {
                var data = new google.visualization.DataTable();
                data.addColumn('datetime', 'Date');
                data.addColumn('number', 'Count');
                data.addRows([
                  ${encode.values.raw.map((item) => `[new Date(${item.date}), ${item.sum}]`).join(',')}
                ]);

                var table = new google.visualization.${options.chart}(document.getElementById('chart'));

                table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
              }
            </script>
          `;
        }

        const html = `
          <html>
            <head>
              ${request.query.refresh ? `<meta http-equiv="refresh" content="${request.query.refresh}">` : ''}            
              ${script}
              <style>
                .button {
                  background-color: #FFF;
                  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1));
                  border: none;
                  cursor: pointer;
                  border-radius: 3px;
                  box-shadow: rgba(0, 0, 0, 0.2) 0 0 0 1px, 
                              rgba(0, 0, 0, 0.2) 0 1px 2px 0, 
                              rgba(255, 255, 255, 0.7) 0 1px 2px 0 inset;
                  color: rgba(0, 0, 0, 0.6);
                  cursor: pointer;
                  display: inline;
                  line-height: 20px;
                  padding: 5px 13px;
                  text-align: center;
                  text-decoration-color: rgba(0, 0, 0, 0.6);
                  text-decoration-line: none;
                  text-decoration-style: solid;
                  text-shadow: rgba(255, 255, 255, 0.7) 0 1px 1px;
                  width: auto;
                }
                
                .button:hover {
                  background-color: #eaeef1;
                }
                
                .control-holder {
                  align-items: center;
                  display:flex;
                }
              
                .styled-select {
                  border-radius: 2px;
                  background-color: #fbfbfb;
                  border: 1px solid #ccc;
                  display: inline-block;
                  line-height: 46px;
                  margin-right: 10px;
                  width: 170px;
                  overflow: hidden;
                  position: relative;
                }
                
                .styled-select:after {
                  background-image: url("data:image/svg+xml,%3Csvg width='16' height='10' viewBox='311 20 16 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23CCC' stroke-width='2' fill='none' d='M312.32 21.83l7.272 6.578L326 21.83'/%3E%3C/svg%3E");
                  background-size: contain;
                  background-repeat: no-repeat;
                  content: '';
                  height: 8px;
                  margin-top: -4px;
                  pointer-events: none;
                  position: absolute;
                  right: 10px;
                  top: 50%;
                  width: 14px;
                }
                
                .styled-select select {
                    -webkit-appearance: none;
                    background: #fbfbfb;
                    border: none;
                    height: 35px;
                    outline: none;
                    padding: 0 0 0 10px;
                    width: 110%;
                }
                
                .svg-container {
                  display: inline-block;
                  position: relative;
                  vertical-align: middle;
                  overflow: hidden;
                  width: 100%;
                  padding-bottom: 32%;
                }
                
                .svg-content {
                  display: inline-block;
                  position: absolute;
                  top: 0;
                  left: 0;
                }
              </style>
            </head>
            <body>
              <form action="${prefix}/embed" method="get" ${request.query.toolbar === '0' ? 'style="display: none"' : ''}>
                <div class="control-holder">
                  <div class="styled-select">
                    <select name="chart">
                      <option value="LineChart" ${options.chart === 'LineChart' ? 'selected' : ''}>Line Chart</option>
                      <option value="Table" ${options.chart === 'Table' ? 'selected' : ''}>Table</option>
                    </select>
                  </div>
                  <div class="styled-select">
                    <select name="period">
                      <option value="">Period</option>
                      <option value="m" ${options.period === 'm' ? 'selected' : ''}>Minute</option>
                      <option value="h" ${options.period === 'h' ? 'selected' : ''}>Hour</option>
                      <option value="d" ${options.period === 'd' ? 'selected' : ''}>Day</option>                
                    </select>
                  </div>                
                  <div class="styled-select">
                    <select name="type">
                      <option value="">Type</option>
                      ${types.results.map((type) => `<option value="${type}" ${(options.type === type) ? 'selected' : ''}>${type}</option>`).join('')}
                    </select>
                  </div>
                  <div class="styled-select">
                    <select name="tag">
                      <option value="">Tag</option>
                      ${tags.map((tag) => `<option value="${tag}" ${(options.tag === tag) ? 'selected' : ''}>${tag}</option>`).join('')}
                    </select>
                  </div>
                  <div class="styled-select">
                    <select name="tagValue">
                      <option value="">Tag Values</option>
                      ${tagValues.map((value) => `<option value="${value}" ${(options.tagValue === value) ? 'selected' : ''}>${value}</option>`).join('')}
                    </select>
                  </div>                
                  <input class="button" type="submit" value="Query"/>
                </div>
              </form>
              <div class="svg-container">
                <img src="http://chartd.co/a.svg?w=580&h=180&d0=${encode.values.string}&ymin=${encode.values.min}&ymax=${encode.values.max}&t=${encodeURIComponent(options.title)}&xmin=${encode.date.min}&xmax=${encode.date.max}&ol=1" class="svg-content">
              </div>
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
