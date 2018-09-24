const Joi = require('joi');

exports.aggregate = {
  path: '/api/report/conversion/aggregate',
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
  async handler (request, h) {
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
    const out = {};
    const req = get[0];
    req.forEach((tmp, reqIndex) => {
      apiCalls.forEach((call, callIndex) => {
        const key = call.option;
        const subkey = call.event;
        if (!out[key]) {
          out[key] = { option: call.option };
        }
        if (!out[key][subkey]) {
          out[key][subkey] = 0;
        }
        if (get[callIndex][reqIndex]) {
          out[key][subkey] += get[callIndex][reqIndex].sum;
        }
      });
    });
    const map = [];
    Object.keys(out).forEach((key) => map.push(out[key]));
    return map;
  }
};
