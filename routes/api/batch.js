const Joi = require('joi');
exports.batch = {
  path: 'track/batch',
  method: 'POST',
  config: {
    validate: {
      payload: {
        events: Joi.array().items(Joi.object().keys({
          type: Joi.string().required(),
          tags: Joi.object(),
          createdOn: Joi.date().default(() => new Date(), 'current timestamp'),
          value: Joi.number().default(1),
          data: Joi.object()
        }))
      }
    }
  },
  handler: {
    autoInject: {
      payload(request, done) {
        done(null, request.payload.events);
      },
      insert(server, payload, done) {
        server.db.tracks.insertMany(payload, done);
      },
      reply(insert, done) {
        done(null, insert.ops);
      }
    }
  }
};
