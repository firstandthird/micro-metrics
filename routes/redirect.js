'use strict';

const _ = require('lodash');

exports.main = {
  method: 'GET',
  path: '/r/',
  handler: (request, reply) => {
    const payload = request.query;
    const to = payload.to;

    if (!to) {
      return reply({ err: 'must provide a location to redirect' });
    }

    _.unset(payload, 'to');

    if (payload.tags) {
      payload.tags = payload.tags.split(',');
    }

    request.server.methods.track(payload);

    reply.redirect(to);
  }
};
