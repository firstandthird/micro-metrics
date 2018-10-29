const Joi = require('joi');
const moment = require('moment');

exports.aggregate = {
  path: 'aggregate',
  method: 'get',
  config: {
    validate: {
      query: {
        period: Joi.string().default('d').allow(['h', 'm', 'd']),
        last: Joi.string().optional(),
        type: Joi.string(),
        tags: Joi.string(),
        fields: Joi.string(),
        value: Joi.number(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional()
      }
    }
  },
  async handler(request, h) {
    const server = request.server;
    if (!request.query.last && !request.query.endDate && !request.query.startDate) {
      const defaultLast = {
        d: '30d',
        h: '1d',
        m: '1h'
      };
      request.query.last = defaultLast[request.query.period];
    }
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
    const dataset = {};
    while (current < end) {
      const date = moment(current);

      if (request.query.startDate && request.query.endDate) {
        date.utcOffset(moment(request.query.startDate).format());
      }

      dataset[current] = {
        dateString: date.toISOString(),
        sum: 0,
        avg: 0,
        max: 0,
        min: 0
      };
      current += period;
    }

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
    const aggregate = await server.db.tracks.aggregate([
      { $match: query },
      { $group }
    ], { explain: false, cursor: {} }).toArray();
    aggregate.forEach((item) => {
      const date = moment(new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour || 0, item._id.minute || 0)); // eslint-disable-line no-underscore-dangle

      if (request.query.startDate && request.query.endDate) {
        date.utcOffset(moment(request.query.startDate).format());
      }

      const timestamp = date.valueOf();
      item.dateString = date.toISOString();
      delete item._id; //eslint-disable-line no-underscore-dangle
      dataset[timestamp] = item;
    });
    const arr = Object.keys(dataset).map((key) => {
      const item = dataset[key];
      item.date = key;
      return item;
    });
    return arr;
  }
};
