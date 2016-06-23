'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker
const hapi = require('hapi');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mockgo');
const get = require('../methods/get.js').method;
const tags = require('../methods/tags.js').method;
const track = require('../methods/track.js').method;
const extractInfo = require('../methods/extractInfo.js').method;
const types = require('../methods/types.js').method;

module.exports = (options, callback) => {
  const server = new hapi.Server({});
  mongo.getConnection('localhost', (err, db) => {
    // add a fake mongo db for testing:
    server.plugins['hapi-mongodb'] = db;
    db.ObjectID = ObjectID;
    server.method('extractInfo', extractInfo, { bind: server });
    server.method('track', track, { bind: server });
    server.method('get', get, { bind: server });
    server.method('tags', tags, { bind: server });
    server.method('types', types, { bind: server });
    server.connection();
    callback(server);
  });
};
