'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker

const hapi = require('hapi');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mockgo');
const get = require('../methods/get.js').method;
const track = require('../methods/track.js').method;
const extractInfo = require('../methods/extractInfo.js').method;
const types = require('../methods/types.js').method;

module.exports = (options, callback) => {
  const server = new hapi.Server({});

  mongo.getConnection('localhost', (err, db) => {
    // add a fake mongo db for testing:
    server.plugins['hapi-mongodb'] = db;
    db.ObjectID = ObjectID;
    server.method('extractInfo', require('../methods/extractInfo.js').method, {bind: server});
    server.method('track', require('../methods/track.js').method, {bind: server});
    server.method('get', require('../methods/get.js').method, {bind: server});
    server.method('tags', require('../methods/tags.js').method, {bind: server});
    server.method('types', require('../methods/types.js').method, {bind: server});
    server.connection();
    callback(server);
  });
};
