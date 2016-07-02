'use strict'
module.exports = {
  method(done) {
    this.plugins['hapi-mongodb'].db.collection('tracks').distinct('type', done);
  }
};
