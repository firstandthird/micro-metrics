const Joi = require('joi');

exports.report = {
  path: 'unique',
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
        value: Joi.number(),
        unique: Joi.string().required()
      }
    }
  },
  async handler(request, h) {
    const server = request.server;
    const filter = request.query || {};
    const query = server.methods.getReportQuery(filter);

    const uniqueId = `$${request.query.unique}`;

    // At a minimum - the unique element should exist
    const q = Object.assign({}, query);
    q[request.query.unique] = { $exists: 1 };
    const find = await server.db.tracks.aggregate([
      {
        $match: q
      },
      {
        $group: {
          _id: uniqueId,
          types: { $addToSet: '$type' },
          tags: { $addToSet: '$tags' },
          values: { $addToSet: '$value' },
          data: { $addToSet: '$data' },
          count: { $sum: 1 }
        }
      }
    ], { explain: false, cursor: {} }).toArray();
    return {
      count: find.length,
      results: find,
    };
  }
};
