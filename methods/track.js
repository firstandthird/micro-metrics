/* eslint-disable strict, no-console */
'use strict';

const Joi = require('joi');
const _ = require('lodash');

module.exports = {
  method(payload, done) {
    if (!done) {
      done = _.noop;
    }

    const server = this;

    payload.tags = server.methods.stringToKeyValue(payload.tags);
    payload.fields = server.methods.stringToKeyValue(payload.fields);

    const validation = Joi.object().keys({
      type: Joi.string().required(),
      createdOn: Joi.number().default(new Date()),
      tags: Joi.object(),
      fields: Joi.object(),
      value: Joi.any().default(1),
      data: Joi.any(),
      userId: Joi.string(),
      sessionId: Joi.string()
    });

    Joi.validate(payload, validation, (err, val) => {
      if (err) {
        server.log(['track', 'validation-error'], { err, message: 'payload failed validation' });
        return done(err);
      }
      if (val.tags) {
        val.tagKeys = Object.keys(val.tags);
      }

      server.db.tracks.insertOne(val, (dbErr, data) => {
        if (dbErr) {
          server.log(['track', 'dbError'], {
            err,
            message: 'Error inserting data into database',
            payload: val
          });

          return done(dbErr);
        }

        if (data.result.ok !== 1) {
          server.log(['track', 'dbError'], {
            err: data.result,
            message: 'Db Insert Result returned ok:0',
            payload: val
          });

          return done({ err: 1, message: 'DB Insert returned ok:0' });
        }

        done(null, val);
      });
    });
  }
};
