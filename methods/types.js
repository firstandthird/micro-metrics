'use strict'
module.exports = {
  method(done) {
    this.db.tracks.distinct('type', done);
  }
};
