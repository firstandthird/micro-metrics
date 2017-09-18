'use strict';
const Joi = require('joi');
const async = require('async');
exports.groupBy = {
  path: 'groupBy{type?}',
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
        const taggedResults = {};
        async.each(groupby, (tag, eachDone) => {
          const subQuery = Object.assign({}, query);
          subQuery[`tags.${request.query.groupby}`] = tag;
          server.db.tracks.aggregate([
            { $match: subQuery },
            { $group }
          ], (eachErr, result) => {
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
      reply(aggregate, done) {
        return done(null, aggregate);
      }
    }
  }
};
