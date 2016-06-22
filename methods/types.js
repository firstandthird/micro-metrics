'use strict'
module.exports = {
  method(done) {
    this.plugins['hapi-mongodb'].collection('tracks').distinct('type', done);
  }
};
