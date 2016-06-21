'use strict'
module.exports = {
  method( done) {
    const db = this.plugins['hapi-mongodb'].collection('tracks').distinct('type', done);
  }
};
