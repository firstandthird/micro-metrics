'use strict';

module.exports = {
  method(request) {
    const ipAddress = (request.headers['x-real-ip']) ? request.headers['x-real-ip'] : request.info.remoteAddress;
    let result = {
      ip: ipAddress,
      userAgent: request.headers['user-agent'],
      referrer: request.info.referrer
    };

    if (typeof request.query.data !== 'undefined') {
      result = Object.assign({}, this.methods.stringToKeyValue(request.query.data), result);
    }

    return result;
  }
};
