'use strict';
// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');

module.exports.withRapptor = (options, callback) => {
  const cwd = process.cwd();
  const rapptor = new Rapptor({
    configPath: `${cwd}/test/conf`,
    cwd,
  });
  rapptor.start((err, server) => {
    if (err) {
      callback(null);
    } else {
      callback(server);
    }
  });
};
