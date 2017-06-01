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
  handler: {
    autoInject: {
      validated(server, request, done) {
        const validated = request.payload;
        validated.tags = server.methods.stringToKeyValue(validated.tags);
        validated.fields = server.methods.stringToKeyValue(validated.fields);
        if (validated.tags) {
          validated.tagKeys = Object.keys(validated.tags);
        }
        if (request.payload.data && request.payload.data.ttl) {
          request.payload.expiresAt = new Date(new Date().getTime() + request.payload.data.ttl);
          delete request.payload.data.ttl;
        }
        return done(null, validated);
      },
      insert(server, validated, done) {
        server.db.tracks.insertOne(validated, done);
      },
      verify(insert, done) {
        if (insert.result.ok !== 1) {
          return done({ err: insert.result, type: 'dbErr', message: 'Db Insert Result returned ok:0', data: insert });
        }
        return done(null, insert.ops[0]);
      },
      reply(verify, done) {
        return done(null, verify);
      }
    }
  }
};
