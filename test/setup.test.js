'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');

module.exports.withRapptor = (options, callback) => {
  const rapptor = new Rapptor({
  });
  rapptor.start((err, server) => {
    callback(err, server);
  });
};

module.exports.cleanupDb = (server) => {
  server.plugins['hapi-mongodb'].db.collection('tracks').drop();
};
