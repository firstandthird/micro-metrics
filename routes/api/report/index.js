'use strict';
const Joi = require('joi');

exports.reportscsv = {
  path: '/api/report.csv',
  method: 'GET',
  handler: {
    autoInject: {
      report(server, request, done) {
        server.req.get('/api/report', { query: request.query }, done);
      },
      csv(server, report, done) {
        const find = report.results;
        find.forEach((record) => {
          delete record._id; // eslint-disable-line no-underscore-dangle
          record.createdOn = new Date(record.createdOn).toISOString();
          if (typeof record.fields === 'object') {
            record.fields = JSON.stringify(record.fields).replace('{', '').replace('}', '');
          }
          if (Array.isArray(record.tagKeys)) {
            record.tagKeys = record.tagKeys.join(',');
          }
        });
        return done(null, server.methods.csv(find));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};


exports.report = {
  path: '/api/report',
  method: 'GET',
  config: {
    validate: {
      query: {
        period: Joi.string().default('h').allow(['h', 'm', 'd']),
        last: Joi.string().default('30d'),
        type: Joi.string(),
        tags: Joi.string(),
        fields: Joi.string(),
        startDate: Joi.string(),
        endDate: Joi.string(),
        value: Joi.number()
      }
    }
  },
  handler: {
    autoInject: {
      query(server, request, done) {
        const filter = request.query || {};
        const query = server.methods.getReportQuery(filter);
        done(null, query);
      },
      find(query, server, done) {
        server.db.tracks.find(query).sort({ createdOn: 1 }).toArray((err, results) => done(err, results));
      },
      reply(request, server, find, done) {
        done(null, {
          count: find.length,
          results: find
        });
      }
    }
  }
};
