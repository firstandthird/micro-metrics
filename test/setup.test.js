// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');
module.exports.server = undefined;
module.exports.withRapptor = async (options, dataSet) => {
  const rapptor = new Rapptor({});
  await rapptor.start();
  module.exports.server = rapptor.server;
  await rapptor.server.db.tracks.remove({});
};

module.exports.stop = async() => {
  await module.exports.server.db.tracks.remove({});
  await module.exports.server.stop();
};
