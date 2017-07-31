'use strict';
const Joi = require('joi');

exports.report = {
  path: 'unique',
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
        unique: Joi.string().required()
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
        const uniqueId = `$${request.query.unique}`;

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
      reply(request, server, find, done) {
        done(null, {
          count: find.length,
          results: find,
        });
      }
    }
  }
};
