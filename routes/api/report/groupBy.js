'use strict';
const Joi = require('joi');
const async = require('async');

exports.groupbycsv = {
  path: 'groupby.csv',
  method: 'get',
  handler: {
    autoInject: {
      groupby(server, request, done) {
        server.req.get('/api/report/groupby', { query: request.query }, done);
      },
      csv(server, groupby, done) {
        // dates in first column
        const columns = [{ label: 'Date', value: 'date' }];
        // each group by value as a column
        // Make sure to sort the group by values alphabetically so the csv stays with the same columns all the t
        const groupByValues = Object.keys(groupby).sort();
        groupByValues.forEach((key) => {
          columns.push({ label: `${key[0].toUpperCase()}${key.substring(1)}`, value: key });
        });
        // get list length, assume same number of elements per term:
        let max = 0;
        groupByValues.forEach((key) => {
          if (groupby[key].length > max) {
            max = groupby[key].length;
          }
        });
        // use sum as the value for each row.
        const rows = [];
        for (let i = 0; i < max; i++) {
          const row = {};
          groupByValues.forEach((key) => {
            if (i >= groupby[key].length) {
              row[key] = 0;
              return;
            }
            const cell = groupby[key][i];
            const date = cell._id;
            row.date = `${date.day}/${date.month}/${date.year}`;
            row[key] = cell.sum;
          });
          rows.push(row);
        }
        return done(null, server.methods.csv(rows, columns));
      },
      send(reply, csv, done) {
        reply(null, csv).header('content-type', 'application/csv');
        return done();
      }
    }
  }
};

exports.groupby = {
  path: 'groupby',
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
      reply(aggregate, done) {
        return done(null, aggregate);
      }
    }
  }
};
