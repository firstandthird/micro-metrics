'use strict';

exports.report = {
  method: 'GET',
  path: '/api/report',
  handler: {
    autoInject: {
      query(server, request, done) {
        const filter = request.query || {};

        const findObj = {};

        if (filter.last) {
          filter.startDate = server.methods.extractStartDate(filter.last);
          filter.endDate = new Date().getTime();
        }

        if (filter.type) {
          findObj.type = filter.type;
        }

        if (filter.tags) {
          const tagObj = server.methods.stringToKeyValue(filter.tags);
          Object.keys(tagObj).forEach((tag) => {
            const value = tagObj[tag];
            findObj[`tags.${tag}`] = (value === true) ? { $exists: 1 } : value;
          });
        }

        if (filter.fields) {
          const fields = server.methods.stringToKeyValue(filter.fields);
          Object.keys(fields).forEach((field) => {
            const value = fields[field];
            findObj[`fields.${field}`] = (value === true) ? { $exists: 1 } : value;
          });
        }

        if (filter.startDate && filter.endDate) {
          findObj.createdOn = {
            $gte: new Date(filter.startDate),
            $lte: new Date(filter.endDate)
          };
        }

        if (filter.value) {
          findObj.value = (isNaN(filter.value / 1)) ? filter.value : filter.value / 1;
        }
        done(null, findObj);
      },
      find(query, server, done) {
        server.db.tracks.find(query).sort({ createdOn: 1 }).toArray((err, results) => done(err, results));
      },
      reply(find, done) {
        done(null, {
          count: find.length,
          results: find
        });
      }
    }
  }
};
