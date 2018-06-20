'use strict';
module.exports = {
  async method(tagKey, filter) {
    if (typeof filter === 'function') {
      done = filter;
      filter = {};
    }
    return this.db.tracks.distinct(`tags.${tagKey}`, filter);
  }
};
