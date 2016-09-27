'use strict';
module.exports = {
  method(tagKey, filter, done) {
    if (typeof filter === 'function') {
      done = filter;
      filter = {};
    }
    this.plugins['hapi-mongodb'].db.collection('tracks').distinct(`tags.${tagKey}`, filter, done);
  }
};
