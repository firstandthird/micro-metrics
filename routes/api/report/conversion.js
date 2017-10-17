const Joi = require('joi');
const async = require('async');

exports.reportcsv = {
  path: '/api/report/conversion.csv',
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
      report(server, request, done) {
        server.req.get('/api/report/conversion', { query: request.query }, done);
      },
      setHeaders: (request, done) => done(null, { 'content-type': 'application/csv' }),
      csv(server, report, setHeaders, done) {
        const headerObj = {};
        report.forEach((item) => {
          Object.keys(item).forEach((key) => {
            if (!headerObj[key]) {
              headerObj[key] = key;
            }
          });
        });
        delete headerObj.date;
        delete headerObj.dateString;
        const headers = [{
          Label: 'Date',
          value: 'dateString'
        }];
        Object.keys(headerObj).forEach((header) => {
          headers.push({
            Label: header[0].toUpperCase() + header.substring(1),
            value: header
          });
        });
        return done(null, server.methods.csv(report, headers));
      },
      reply(csv, done) {
        done(null, csv);
      }
    }
  }
};

exports.report = {
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
            if (get[callIndex][reqIndex]) {
              columns[`${call.option} - ${call.event}`] = get[callIndex][reqIndex].sum;
            }
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

exports.aggregatecsv = {
  path: '/api/report/conversion/aggregate.csv',
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
      report(server, request, done) {
        server.req.get('/api/report/conversion/aggregate', { query: request.query }, done);
      },
      setHeaders: (request, done) => done(null, { 'content-type': 'application/csv' }),
      csv(server, report, setHeaders, done) {
        const headers = [{
          Label: 'Option',
          value: 'option'
        },
        {
          Label: 'Success',
          value: 'success'
        },
        {
          Label: 'Impression',
          value: 'impression'
        }];
        return done(null, server.methods.csv(report, headers));
      },
      reply(csv, done) {
        done(null, csv);
      }
    }
  }
};

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
        done(null, Object.values(out));
      },
      reply(map, done) {
        done(null, map);
      }
    }
  }
};
