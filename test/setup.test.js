// configures a hapi server that can be used
// for unit testing outside of docker
const Rapptor = require('rapptor');
module.exports.server = undefined;
module.exports.withRapptor = async (options, dataSet) => {
  const rapptor = new Rapptor({});
  await rapptor.start();
  module.exports.server = rapptor.server;
  await rapptor.server.db.tracks.drop(async() => {
  });
};

module.exports.stop = () => {
  module.exports.server.db.tracks.drop(async() => {
    await module.exports.server.stop();
  });
};
