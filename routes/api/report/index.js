'use strict';
const Joi = require('joi');

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
        value: Joi.number(),
        unique: Joi.string()
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
      find(query, request, server, done) {
        if (request.query.unique) {
          return done();
        }
        server.db.tracks.find(query).sort({ createdOn: 1 }).toArray((err, results) => done(err, results));
      },
      findUnique(query, request, server, done) {
        if (!request.query.unique) {
          return done();
        }

        const uniqueId = `\$${request.query.unique}`;

        // At a minimum - the unique element should exist
        const q = Object.assign({}, query);
        q[request.query.unique] = { $exists: 1 };
        server.db.tracks.aggregate([
          {
            $match: q
          },
          {
            $group: {
              _id: uniqueId,
              types: { $addToSet: '$type' },
              tags: { $addToSet: '$tags' },
              values: { $addToSet: '$value' },
              data: { $addToSet: '$data' },
              count: { $sum: 1 }
            }
          }
        ], done);
      },
      setHeaders: (request, done) => {
        done(null, request.params.type === '.csv' ? { 'content-type': 'application/csv' } : {});
      },
      reply(request, server, find, findUnique, setHeaders, done) {
        if (request.params.type === '.csv') {
          find.forEach((record) => {
            delete record._id; // eslint-disable-line no-underscore-dangle
            record.createdOn = record.createdOn.toISOString();
            if (typeof record.fields === 'object') {
              record.fields = JSON.stringify(record.fields).replace('{', '').replace('}', '');
            }
            if (Array.isArray(record.tagKeys)) {
              record.tagKeys = record.tagKeys.join(',');
            }
          });
          return done(null, server.methods.csv(find));
        }

        const fnd = find || findUnique;
        done(null, {
          count: fnd.length,
          results: fnd,
        });
      }
    }
  }
};
