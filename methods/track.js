/* eslint-disable strict, no-console */
'use strict';
const Joi = require('joi');
const _ = require('lodash');
const async = require('async');

module.exports = {
  method(payload, allDone) {
    if (!allDone) {
      allDone = _.noop;
    }
    const server = this;
    async.autoInject({
      validate(done) {
        const validation = Joi.object().keys({
          type: Joi.string().required(),
          tags: Joi.object(),
          fields: Joi.object(),
          value: Joi.any().default(1),
          data: Joi.any(),
          userId: Joi.string(),
          sessionId: Joi.string()
        });
        payload.tags = server.methods.stringToKeyValue(payload.tags);
        payload.fields = server.methods.stringToKeyValue(payload.fields);
        Joi.validate(payload, validation, (err, data) => {
          if (err) {
            return done({ err, type: 'validation-error', message: 'payload failed validation' });
          }
          return done(null, data);
        });
      },
      insert(validate, done) {
        if (validate.tags) {
          validate.tagKeys = Object.keys(validate.tags);
        }
        validate.createdOn = new Date();
        server.db.tracks.insertOne(validate, (err, data) => {
          if (err) {
            return done({ err, type: 'dbErr', message: 'Error inserting data into database', data: validate });
          }
          return done(null, data);
        });
      },
      verify(insert, done) {
        if (insert.result.ok !== 1) {
          return done({ err: insert.result, type: 'dbErr', message: 'Db Insert Result returned ok:0', data: insert });
        }
        return done(null, insert.ops[0]);
      }
    }, (err, results) => {
      if (err) {
        server.log(['track', err.type], { err: err.err, message: err.message, data: err.data });
        return allDone(err);
      }
      return allDone(null, results.verify);
    });
  }
};
