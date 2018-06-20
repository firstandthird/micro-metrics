const Joi = require('joi');

exports.report = {
  path: '/api/report/conversion',
  method: 'get',
  config: {
    validate: {
      query: {
        name: Joi.string().required(),
        period: Joi.string().default('d'),
        last: Joi.string(),
      }
    }
  },
  handler: async (request, h) => {
    const server = request.server;
    const name = request.query.name;
    const events = await server.req.get('/api/tag-values', {
      query: {
        type: `conversion.${name}`,
        tag: 'event'
      }
    });
    const options = await server.req.get('/api/tag-values', {
      query: {
        type: `conversion.${name}`,
        tag: 'option'
      }
    });
    const apiCalls = [];
    events.forEach((event) => {
      options.forEach((option) => {
        const query = {
          type: `conversion.${name}`,
          tags: `event:${event},option:${option}`
        };
        if (request.query.period) {
          query.period = request.query.period;
        }
        if (request.query.last) {
          query.last = request.query.last;
        }

        apiCalls.push({
          event,
          option,
          query
        });
      });
    });
    const get = await Promise.all(apiCalls.map(call => server.req.get('/api/report/aggregate', {
      query: call.query
    })));
    const req = get[0];
    const map = [];
    req.forEach((tmp, reqIndex) => {
      const columns = {
        dateString: req[reqIndex].dateString,
        date: req[reqIndex].date
      };
      apiCalls.forEach((call, callIndex) => {
        if (get[callIndex][reqIndex]) {
          columns[`${call.option} - ${call.event}`] = get[callIndex][reqIndex].sum;
        }
      });
      return map.push(columns);
    });

    return map;
  }
};
