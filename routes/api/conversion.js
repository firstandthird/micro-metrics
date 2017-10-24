const Joi = require('joi');

exports.conversions = {
  method: 'GET',
  path: '/api/conversions',
  handler(request, reply) {
    request.server.db.tracks.distinct('type', { type: { $regex: /^conversion/ } }, (err, results) => {
      if (err) {
        return reply(err);
      }
      return reply(null, results);
    });
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
        session: Joi.string()
      }
    }
  },
  handler: {
    autoInject: {
      inject(server, request, done) {
        const payload = request.payload;
        const data = server.methods.extractInfo(request);
        data.session = payload.session;
        server.req.post('/api/track', {
          payload: {
            type: `conversion.${payload.name}`,
            tags: {
              event: payload.event,
              option: payload.option,
            },
            data,
            value: 1
          }
        }, done);
      },
      reply(inject, done) {
        done(null, inject);
      }
    }
  }
};
