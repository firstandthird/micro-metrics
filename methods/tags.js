'use strict'
var _ = require('lodash');
module.exports = {
  method: function(filter, done) {
    const db = this.plugins['hapi-mongodb'].collection('tracks');
    db.mapReduce(
      function() {
        emit('1', this.tags);
      },
      function(key, allTagLists) {
        const ret = {};
        for (var i = 0; i < allTagLists.length; i++) {
          const curTagList = allTagLists[i];
          for (var j = 0; j < curTagList.length; j++) {
            const curTag = curTagList[j];
            const tagType = Object.keys(curTag)[0];
            const tagValue = curTag[tagType];
            if (ret[tagType] && ret[tagType].indexOf(tagValue) < 0) {
              ret[tagType].push(tagValue);
            } else {
              ret[tagType] = [tagValue];
            }
          }
        }
        return ret;
      },
      {
        out: 'uniqueTags',
        query: filter
      }
      ,function(err, newDb) {
        newDb.find({}).toArray(done);
      }
    );
  }
};
