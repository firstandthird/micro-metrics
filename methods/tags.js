'use strict'
var _ = require('lodash');
module.exports = {
  method: function(filter, done) {
    this.plugins['hapi-mongodb'].collection('tracks').distinct('tags', filter, done);
  }
};
