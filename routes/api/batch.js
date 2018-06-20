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
  async handler(request, h) {
    const server = request.server;
    const payloadEvents = request.payload.events;
    const payload = payloadEvents.map((event) => {
      event.tags = server.methods.stringToKeyValue(event.tags);
      if (event.tags) {
        event.tagKeys = Object.keys(event.tags);
      }
      return event;
    });
    const insert = await server.db.tracks.insertMany(payload);
    return insert.ops;
  }
};
