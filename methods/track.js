/* eslint-disable strict, no-console */
'use strict';

const Joi = require('joi');
const _ = require('lodash');

module.exports = {
  method(payload, trackData, done) {
    if (!done) {
      done = _.noop;
    }

    if (!trackData) {
      trackData = {};
    }

    const server = this;

    if (payload.tags && _.isString(payload.tags)) {
      payload.tags = payload.tags.split(',');
    }

    if (!payload.data) {
      payload.data = {};
    }

    payload.data = _.merge(payload.data, trackData);

    const validation = Joi.object().keys({
      type: Joi.string().required(),
      tags: Joi.array(),
      value: Joi.any().default(1),
      data: Joi.any(),
      userId: Joi.string()
    });

    Joi.validate(payload, validation, (err, val) => {
      if (err) {
        server.log(['track', 'validation-error'], { err, message: 'payload failed validation' });
        return done(err);
      }

      val.createdOn = new Date();

      const db = server.plugins['hapi-mongodb'].db;
      db.collection('tracks').insertOne(val, (dbErr, data) => {
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
