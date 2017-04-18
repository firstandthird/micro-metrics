'use strict';
module.exports = {
  method(tagKey, filter, done) {
    if (typeof filter === 'function') {
      done = filter;
      filter = {};
    }
    this.db.tracks.distinct(`tags.${tagKey}`, filter, done);
  }
};
