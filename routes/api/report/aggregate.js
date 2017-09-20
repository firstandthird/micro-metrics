'use strict';
const Joi = require('joi');
const async = require('async');
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
        groupby: Joi.string(),
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
      // get unique list of tags to group by:
      groupby(server, request, done) {
        if (!request.query.groupby) {
          return done();
        }
        server.req.get(`/api/tag-values?tag=${request.query.groupby}`, {}, done);
      },
      aggregate(server, request, query, groupby, done) {
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
        if (!groupby) {
          return server.db.tracks.aggregate([
            { $match: query },
            { $group }
          ], { explain: false }, done);
        }
        // if we are grouping the aggregates by keys:
        const taggedResults = {};
        async.each(groupby, (tag, eachDone) => {
          const subQuery = Object.assign({}, query);
          subQuery[`tags.${request.query.groupby}`] = tag;
          server.db.tracks.aggregate([
            { $match: subQuery },
            { $group }
          ], { explain: false }, (eachErr, result) => {
            if (eachErr) {
              return eachDone(eachErr);
            }
            taggedResults[tag] = result;
            return eachDone();
          });
        }, (err) => {
          if (err) {
            return done(err);
          }
          return done(null, taggedResults);
        });
      },
      map(dataset, aggregate, groupby, done) {
        // if we're just getting the aggregate data grouped by tag value then we're done:
        if (groupby) {
          return done();
        }
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
      convertOutput(server, request, setHeaders, map, aggregate, groupby, done) {
        if (groupby) {
          return done(null, aggregate);
        }
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
