'use strict';
const Joi = require('joi');

exports.track = {
  method: 'POST',
  path: '/api/track',
  config: {
    validate: {
      payload: Joi.object().keys({
        type: Joi.string().required(),
        tags: Joi.any(),
        fields: Joi.any(),
        value: Joi.number().default(1),
        data: Joi.any(),
        createdOn: Joi.date().default(() => new Date(), 'default to current date if not specified'),
        userId: Joi.string(),
        sessionId: Joi.string()
      })
    }
  },
  async handler(request, h) {
    const server = request.server;
    const validated = request.payload;
    validated.tags = server.methods.stringToKeyValue(validated.tags);
    validated.fields = server.methods.stringToKeyValue(validated.fields);
    validated.data = server.methods.stringToKeyValue(validated.data);
    if (validated.tags) {
      validated.tagKeys = Object.keys(validated.tags);
    }
    const insert = await server.db.tracks.insertOne(validated);
    return insert.ops[0];
  }
};
