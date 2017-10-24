'use strict';
const Joi = require('joi');

exports.aggregatecsv = {
  path: 'aggregate.csv',
  method: 'get',
  handler: {
    autoInject: {
      aggregate(server, request, done) {
        console.log('---')
        console.log('---')
        console.log('---')
        server.req.get('/api/report/conversion/aggregate', { query: request.query }, done);
      },
      map(aggregate, done) {
        aggregate.forEach((record) => {
          delete record.date;
        });
        done(null, aggregate);
      },
      csv(server, aggregate, done) {
        return done(null, server.methods.csv(aggregate, [
          {
            label: 'Date',
            value: 'dateString'
          },
          {
            label: 'Sum',
            value: 'sum'
          },
          {
            label: 'Avg',
            value: 'avg'
          },
          {
            label: 'Max',
            value: 'max'
          },
          {
            label: 'Min',
            value: 'min'
          },
        ]));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};

exports.aggregate = {
  path: 'aggregate',
  method: 'get',
  config: {
    validate: {
      query: {
        period: Joi.string().default('d').allow(['h', 'm', 'd']),
        last: Joi.string(),
        type: Joi.string(),
        tags: Joi.string(),
        fields: Joi.string(),
        value: Joi.number()
      }
    }
  },
  handler: {
    autoInject: {
      query(server, request, done) {
        if (!request.query.last) {
          const defaultLast = {
            d: '30d',
            h: '1d',
            m: '1h'
          };
          request.query.last = defaultLast[request.query.period];
        }
        const query = server.methods.getReportQuery(request.query);
        done(null, query);
      },
      dataset(query, request, done) {
        let period = 1000 * 60; //one minute
        if (['h', 'd'].indexOf(request.query.period) !== -1) {
          period = period * 60;
        }
        if (request.query.period === 'd') {
          period = period * 24;
        }
        const start = query.createdOn.$gte.getTime();
        const end = query.createdOn.$lte.getTime();
        let current = start;
        const obj = {};
        while (current < end) {
          obj[current] = {
            dateString: new Date(current).toISOString(),
            sum: 0,
            avg: 0,
            max: 0,
            min: 0
          };
          current += period;
        }
        done(null, obj);
      },
      aggregate(server, request, query, done) {
        const id = {
          day: { $dayOfMonth: '$createdOn' },
          month: { $month: '$createdOn' },
          year: { $year: '$createdOn' },
        };
        if (['h', 'm'].indexOf(request.query.period) !== -1) {
          id.hour = { $hour: '$createdOn' };
        }
        if (request.query.period === 'm') {
          id.minute = { $minute: '$createdOn' };
        }
        const $group = {
          _id: id,
          sum: { $sum: '$value' },
          avg: { $avg: '$value' },
          max: { $max: '$value' },
          min: { $min: '$value' }
        };
        return server.db.tracks.aggregate([
          { $match: query },
          { $group }
        ], { explain: false }, done);
      },
      map(dataset, aggregate, done) {
        aggregate.forEach((item) => {
          const date = new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour || 0, item._id.minute || 0); // eslint-disable-line no-underscore-dangle
          const timestamp = date.getTime();
          item.dateString = date.toISOString();
          delete item._id; //eslint-disable-line no-underscore-dangle
          dataset[timestamp] = item;
        });
        const arr = Object.keys(dataset).map((key) => {
          const item = dataset[key];
          item.date = key;
          return item;
        });
        return done(null, arr);
      },
      reply(map, done) {
        return done(null, map);
      },
    }
  }
};
