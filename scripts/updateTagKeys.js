// loads rapptor and executes the server method to update the tag keys:
'use strict';
const Rapptor = require('rapptor');
const rapptor = new Rapptor({
});
rapptor.start((err, server, config) => {
  console.log('migrating!')
  server.methods.migrationScript()
});
