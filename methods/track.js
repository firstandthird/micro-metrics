/* eslint-disable strict, no-console */
'use strict';

const Joi = require('joi');
const Logr = require('logr');
const _ = require('lodash');

const log = new Logr({
  setDefaults: true,
  defaultTags: ['micrometrics'],
  type: 'console',
  renderOptions: {
    console: {
      pretty: true
    }
  }
});

module.exports = {
  method(payload, done) {
    if (!done) {
      done = _.noop;
    }

    const server = this;

    const validation = Joi.object().keys({
      type: Joi.string().required(),
      tags: Joi.array(),
      value: Joi.any().default(1),
      data: Joi.any(),
      userId: Joi.string()
    });

    Joi.validate(payload, validation, (err, val) => {
      if (err) {
        log(['track', 'validation-error'], { err, message: 'payload failed validation' });
        return done(err);
      }

      val.createdOn = new Date();

      const db = server.plugins['hapi-mongodb'].db;
      db.collection('tracks').insertOne(val, (dbErr, data) => {
        if (dbErr) {
          log(['track', 'dbError'], {
            err,
            message: 'Error inserting data into database',
            payload: val
          });

          return done(dbErr);
        }

        if (data.result.ok !== 1) {
          log(['track', 'dbError'], {
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
