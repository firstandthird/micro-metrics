const Joi = require('joi');
const async = require('async');
exports.aggregate = {
  path: '/api/report/conversion{type?}',
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
        const out = [];
        const req = get[0];
        req.forEach((tmp, reqIndex) => {
          const columns = {
            dateString: req[reqIndex].dateString,
            date: req[reqIndex].date
          };
          apiCalls.forEach((call, callIndex) => {
            columns[`${call.option} - ${call.event}`] = get[callIndex][reqIndex].sum;
          });
          out.push(columns);
        });
        done(null, out);
      },
      reply(map, done) {
        done(null, map);
      }
    }
  }
};
