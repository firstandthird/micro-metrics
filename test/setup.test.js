'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');

module.exports.server = undefined;
module.exports.withRapptor = (options, dataSet, callback) => {
  const rapptor = new Rapptor({
  });
  rapptor.start((err, server) => {
    module.exports.server = server;
    if (err) {
      return callback(err);
    }
    module.exports.server.plugins['hapi-mongodb'].db.collection('tracks').drop();
    if (dataSet.length > 0) {
      module.exports.server.plugins['hapi-mongodb'].db.collection('tracks').insertMany(dataSet, callback);
    } else {
      return callback();
    }
  });
};

module.exports.stop = (callback) => {
  module.exports.server.plugins['hapi-mongodb'].db.collection('tracks').drop();
  module.exports.server.stop((err) => { callback(err); });
};
