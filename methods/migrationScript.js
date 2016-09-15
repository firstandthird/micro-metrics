'use strict';
const async = require('async');

// # of items to update in each pull
// we will continue pulling batches of this size
// until we get no more db objects
const batchSize = 1000;
// # of ms to wait before pulling the next batch of objects from the db:
const rateLimit = 1000;

module.exports = {
  method: function() {
    const db = this.plugins['hapi-mongodb'].db.collection('tracks');
    // match criteria is all objects that do not have tagKeys defined
    const criteria = {
      tagKeys: { $exists: false }
    };
    // set to true when we are done:
    let noItemsLeft = false;
    const condition = () => {
      return noItemsLeft;
    };
    let count = 0;
    const updateBatch = (done) => {
      console.log(`pulling batch #${count}`);
      count++;
      const cursor = db.find(criteria).limit(batchSize);
      cursor.toArray((err, arr) => {
        if (err) {
          console.log(err);
          console.log('( we will keep executing despite this error, until interrupted by user...)');
          return setTimeout(done, rateLimit);
        }
        if (arr.length === 0) {
          noItemsLeft = true;
        }
        async.each(arr, (item, thisDone) => {
          item.tagKeys = Object.keys(item.tags);
          db.update({ _id: item._id }, { $set: { tagKeys: Object.keys(item.tags) }}, thisDone);
        }, (err) => {
          if (err) {
            console.log(err);
            console.log('( we will keep executing despite this error, until interrupted by user...)');
          }
          setTimeout(done, rateLimit);
        })
      });
    };
    const whenDone = (err) => {
      if (err) {
        console.log(err)
      }
      console.log('process done!');
    };
    console.log('Beginning now....');
    async.until(condition, updateBatch, whenDone);
  }
};
