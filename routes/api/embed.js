exports.embed = {
  path: '/embed',
  method: 'get',
  handler: async (request, h) => {
    const server = request.server;
    const types = await server.req.get('/api/types', {});
    let type = request.query.type;
    const tags = await server.req.get('/api/tags', { query: { type } });
    if (!request.query.tag) {
      let tagValues = [];
    } else {
      tagValues = await server.req.get('/api/tag-values', { query: { tag: request.query.tag } });
    }
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
    if (request.query.last) {
      query.last = request.query.last;
    }
    const aggregate = await server.req.get('/api/report/aggregate', { query });
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

    const encode = {
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
    };
    const chart = request.query.chart || 'LineChart';
    type = request.query.type;
    const period = request.query.period;

    let title = '';

    if (type) {
      title = type;
    }

    if (request.query.last) {
      title += ` (last ${request.query.last})`;
    } else if (period) {
      const periods = {
        d: '30 days',
        h: 'day',
        m: 'hour'
      };

      title += ` (last ${periods[period]})`;
    }

    title = title.trim();

    const options = {
      chart,
      type,
      period,
      title
    };
    let content = '';

    if (options.chart !== 'LineChart') {
      const body = encode.values.raw.map(v => {
        let date = v.dateString.slice(0, 10);

        if (options.period === 'h') {
          date = `${date} ${v.dateString.slice(11, 16)}`;
        }

        return `<tr>
            <td>${date}</td>
            <td>${v.sum}</td>
        </tr>`;
      }).join('');

      content = `
        <div class="table-header">
          <table cellpadding="0" cellspacing="0" border="0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Content</th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="table-body">
          <table>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    } else {
      content = `<div class="svg-container"><img src="http://chartd.co/a.svg?w=580&h=180&d0=${encode.values.string}&ymin=${encode.values.min}&ymax=${encode.values.max}&t=${encodeURIComponent(options.title)}&xmin=${encode.date.min}&xmax=${encode.date.max}&ol=1" class="svg-content"></div>`;
    }

    const html = `
      <html>
        <head>
          ${request.query.refresh ? `<meta http-equiv="refresh" content="${request.query.refresh}">` : ''}

          <style>
            html,
            body {
              margin: 0;
              padding: 0;
              border: 0;
              font-size: 100%;
              font: inherit;
              vertical-align: baseline;
            }

            *,
            *:after,
            *:before {
              -webkit-box-sizing: border-box;
              -moz-box-sizing: border-box;
              box-sizing: border-box;
            }

            table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
              border-spacing: 0;
              font-family: arial, sans-serif;
              max-width: 100%;
              background-color: transparent;
            }

            table th {
              background: #eeeeee;
              vertical-align: bottom;
            }

            table th,
            table td {
              font-weight: normal;
              font-size: 12px;
              padding: 8px 15px;
              line-height: 20px;
              text-align: left;
              vertical-align: middle;
              border-top: 1px solid #dddddd;
            }

            ${request.query.height ? `
            .table-body {
              height: ${request.query.height}px;
              overflow: scroll;
            }` : ''}

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
        <body>${content}</body>
      </html>
    `;

    if (request.query.raw === '1') {
      return aggregate;
    }
    return html;
  }
};
