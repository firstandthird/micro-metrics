const Joi = require('joi');
const async = require('async');

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
  handler: {
    autoInject: {
      name(request, done) {
        done(null, request.query.name);
      },
      events(name, server, done) {
        server.req.get('/api/tag-values', {
          query: {
            type: `conversion.${name}`,
            tag: 'event'
          }
        }, done);
      },
      options(name, server, done) {
        server.req.get('/api/tag-values', {
          query: {
            type: `conversion.${name}`,
            tag: 'option'
          }
        }, done);
      },
      apiCalls(name, request, events, options, done) {
        const calls = [];
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
            calls.push({
              event,
              option,
              query
            });
          });
        });
        done(null, calls);
      },
      get(apiCalls, server, done) {
        async.map(apiCalls, (call, next) => {
          server.req.get('/api/report/aggregate', {
            query: call.query
          }, next);
        }, done);
      },
      map(apiCalls, get, done) {
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
        const ret = [];
        Object.keys(out).forEach((key) => { ret.push(out[key]); });
        done(null, ret);
      },
      reply(map, done) {
        done(null, map);
      }
    }
  }
};
