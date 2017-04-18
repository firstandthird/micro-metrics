'use strict';
module.exports = {
  method(filter, done) {
    if (typeof filter === 'function') {
      done = filter;
      filter = {};
    }
    this.db.tracks.distinct('tagKeys', filter, done);
  }
};
