'use strict';
const Joi = require('joi');
exports.aggregate = {
  path: 'aggregate',
  method: 'get',
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
        const query = server.methods.getReportQuery(request.query);
        done(null, query);
      },
      aggregate(server, request, query, done) {
        const id = {
          day: { $dayOfMonth: '$createdOn' },
          month: { $month: '$createdOn' },
          year: { $year: '$createdOn' },
        };
        if (request.query.period === 'h' || request.query.period === 'm') {
          id.hour = { $hour: '$createdOn' };
        }
        if (request.query.period === 'm') {
          id.minute = { $minute: '$createdOn' };
        }

        server.db.tracks.aggregate([
          { $match: query },
          {
            $group: {
              _id: id,
              total: { $sum: '$value' },
              avg: { $avg: '$value' },
              max: { $max: '$value' },
              min: { $min: '$value' }
            }
          }
        ], done);
      },
      map(aggregate, done) {
        const out = aggregate.map((item) => {
          item.date = new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour || 0, item._id.minute || 0); // eslint-disable-line no-underscore-dangle
          item.timestamp = item.date.getTime();
          delete item._id; //eslint-disable-line no-underscore-dangle
          return item;
        });
        done(null, out);
      },
      reply(map, done) {
        done(null, map);
      }
    }
  }
};
