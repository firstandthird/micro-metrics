'use strict';
const Joi = require('joi');
const csv = require('../../../methods/csv.js');
exports.report = {
  path: '/api/report{type?}',
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
        if (request.params.type === '.csv') {
          return done(null, server.methods.csv(find));
        }
        done(null, {
          count: find.length,
          results: find
        });
      }
    }
  }
};
