'use strict';

module.exports = {
  method(request) {
    const ipAddress = (request.headers['x-real-ip']) ? request.headers['x-real-ip'] : request.info.remoteAddress;
    return {
      ip: ipAddress,
      userAgent: request.headers['user-agent'],
      referrer: request.info.referrer
    };
  }
};
