const Joi = require('joi');

exports.conversions = {
  method: 'GET',
  path: '/api/conversions',
  async handler(request, h) {
    const results = await request.server.db.tracks.distinct('type', { type: { $regex: /^conversion/ } });
    return results;
  }
};

exports.conversion = {
  method: 'POST',
  path: '/api/conversion',
  config: {
    validate: {
      payload: {
        name: Joi.string().required(),
        event: Joi.string().required(),
        option: Joi.string().required(),
        session: Joi.string(),
        data: Joi.object()
      }
    }
  },
  async handler(request, h) {
    const server = request.server;
    const payload = request.payload;
    const data = payload.data || {};
    data.session = payload.session;
    const inject = await server.req.post('/api/track', {
      payload: {
        type: `conversion.${payload.name}`,
        tags: {
          event: payload.event,
          option: payload.option,
        },
        data,
        value: 1
      }
    });
    return inject;
  }
};
