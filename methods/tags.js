'use strict';
const _ = require('lodash');
module.exports = {
  method: function(filter, done) {
    const db = this.plugins['hapi-mongodb'].db.collection('tracks');
    const ret = {};
    db.find(filter).toArray((err, results) => {
      _.each(results, (item) => {
        _.each(item.tags, (tag, key) => {
          if (ret[key]) {
            ret[key] = _.union(ret[key], [tag]);
          } else {
            ret[key] = [tag];
          }
        });
      });
      done(null, ret);
    });
  }
};
