'use strict';
module.exports = {
  method(filter, done) {
    if (typeof filter === 'function') {
      done = filter;
      filter = {};
    }
    this.plugins['hapi-mongodb'].db.collection('tracks').distinct('tagKeys', filter, done);
  }
};
