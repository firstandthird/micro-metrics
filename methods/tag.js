'use strict';
module.exports = {
  method: function(tagKey, filter, done) {
    this.plugins['hapi-mongodb'].db.collection('tracks').distinct(`tags.${tagKey}`, filter, done);
  }
};
