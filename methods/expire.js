'use strict';
// will go through the db and delete all expiresOn dates older than the current time:
// this will not delete tracks that didn't specify expiresOn:
module.exports = {
  method(callback) {
    this.db.tracks.remove({
      $and: [
        { expiresOn: { $lte: new Date() } },
        { expiresOn: { $exists: true } }
      ]
    }, callback);
  }
};