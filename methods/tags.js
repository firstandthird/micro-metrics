'use strict';
module.exports = {
  method: function(filter, done) {
    this.plugins['hapi-mongodb'].db.collection('tracks').distinct('tagKeys', filter, done);
  }
};
