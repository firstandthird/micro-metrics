'use strict';
module.exports = {
  method: function(filter, done) {
    const db = this.plugins['hapi-mongodb'].collection('tracks');
    // mongo mapreduce functions must use es5 and cannot use module dependencies:
    db.mapReduce(
      function() {
        // emit is a built-in function used by mongo's mapReduce
        emit('1', this.tags);
      },
      function(key, allTagLists) {
        const ret = {};
        for (var i = 0; i < allTagLists.length; i++) {
          const curTagList = allTagLists[i];
          const keys = Object.keys(curTagList);
          for (var j = 0; j < keys.length; j++) {
            var curTag = curTagList[j];
            var tagType = keys[j];
            var tagValue = curTagList[tagType];
            // add to list only if not already in it:
            if (ret[tagType]) {
              if (ret[tagType].indexOf(tagValue) < 0) {
                ret[tagType].push(tagValue);
              }
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
      },
      function(err, newDb) {
        newDb.find({}).toArray(done);
      }
    );
  }
};
