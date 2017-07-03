const Joi = require('joi');
exports.batch = {
  path: 'track/batch',
  method: 'POST',
  config: {
    validate: {
      payload: {
        events: Joi.array().items(Joi.object().keys({
          type: Joi.string().required(),
          tags: Joi.any(),
          createdOn: Joi.date().default(() => new Date(), 'current timestamp'),
          value: Joi.number().default(1),
          data: Joi.object()
        }))
      }
    }
  },
  handler: {
    autoInject: {
      payload(request, server, done) {
        const payloadEvents = request.payload.events;
        const events = payloadEvents.map((event) => {
          event.tags = server.methods.stringToKeyValue(event.tags);
          if (event.tags) {
            event.tagKeys = Object.keys(event.tags);
          }
          return event;
        });
        return done(null, events);
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
