'use strict';
const Joi = require('joi');

exports.aggregate = {
  path: 'aggregate{type?}',
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
      setHeaders: (request, done) => {
        let contentType = {};
        if (request.params.type === '.csv') {
          contentType = { 'content-type': 'application/csv' };
        }
        if (request.params.type === '.html') {
          contentType = { 'content-type': 'application/html' };
        }
        return done(null, contentType);
      },
      convertOutput(server, request, setHeaders, map, aggregate, done) {
        if (request.params.type === '.csv') {
          map.forEach((record) => {
            delete record.date;
          });
        }
        if (!setHeaders['content-type']) {
          return done(null, map);
        }
        if (setHeaders['content-type'].indexOf('csv') !== -1) {
          return done(null, server.methods.csv(map, [
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
        }
        if (setHeaders['content-type'].endsWith('html')) {
          return done(null, server.methods.html(map));
        }
      },
      reply(convertOutput, done) {
        return done(null, convertOutput);
      }
    }
  }
};
