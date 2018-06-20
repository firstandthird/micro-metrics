'use strict';
const Joi = require('joi');

exports.report = {
  path: '/api/report',
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
        value: Joi.number()
      }
    }
  },
  async handler(request, h) {
    const server = request.server;
    const filter = request.query || {};
    const query = server.methods.getReportQuery(filter);
    const find = await server.db.tracks.find(query).sort({ createdOn: 1 }).toArray();
    return {
      count: find.length,
      results: find
    };
  }
};
