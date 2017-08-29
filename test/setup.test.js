'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');
const path = require('path');
module.exports.server = undefined;
module.exports.withRapptor = (options, dataSet, callback) => {
  const rapptor = new Rapptor({
    configPath: path.join(process.cwd(), 'conf')
  });
  rapptor.start((err, server) => {
    module.exports.server = server;
    if (err) {
      return callback(err);
    }
    console.log('server plugins');
    console.log('server plugins');
    console.log('server plugins');
    console.log(path.join(process.cwd(), 'conf'));
    console.log(server.db);
    console.log(server.plugins);
    module.exports.server.db.tracks.drop(() => {
      if (dataSet.length > 0) {
        module.exports.server.db.tracks.insertMany(dataSet, callback);
      } else {
        return callback();
      }
    });
  });
};

module.exports.stop = (callback) => {
  module.exports.server.db.tracks.drop(() => {
    module.exports.server.stop((err) => {
      callback(err);
    });
  });
};
