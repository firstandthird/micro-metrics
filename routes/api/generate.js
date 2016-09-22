'use strict';

exports.generate = {
  method: 'POST',
  path: '/api/generate',
  handler(request, reply) {
    // this route is only accessible in test mode!
    if (!request.server.settings.app.allowGeneratedData) {
      return reply('Disabled').code(401);
    }
    // 1000 items by default
    const numEntries = request.query.numEntries ? request.query.numEntries : 1000;
    // up to 30 days into the past by default
    const startDate = request.query.startDate ? request.query.startDate : new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
    request.server.methods.generate(startDate, numEntries, (err, result) => {
      if (err) {
        return reply(err).code(500);
      }
      return reply(result);
    });
  }
};
