'use strict';
const Joi = require('joi');

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
  async handler(request, h) {
    if (!request.query.last) {
      const defaultLast = {
        d: '30d',
        h: '1d',
        m: '1h'
      };
      request.query.last = defaultLast[request.query.period];
    }
    const server = request.server;
    const query = server.methods.getReportQuery(request.query);
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
    const groupby = await server.req.get(`/api/tag-values?tag=${request.query.groupby}`, {});
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
    await Promise.all(groupby.map(tag => new Promise(async(resolve, reject) => {
      const subQuery = Object.assign({}, query);
      subQuery[`tags.${request.query.groupby}`] = tag;
      const result = await server.db.tracks.aggregate([
        { $match: subQuery },
        { $group }
      ], { explain: false, cursor: {} }).toArray();
      taggedResults[tag] = result;
    })));
    return taggedResults;
  }
};
