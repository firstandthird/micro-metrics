const _ = require('lodash');

// generates numEntries of random data, having between 0 and 3 tags and dating from present back to startDate:
module.exports = function(startDate, numEntries, callback) {
  const getRandomDate = () => {
    return new Date(_.random(startDate, new Date().getTime()));
  };
  const randomTypes = ['Views', 'Posts', 'Users', 'Responses', 'Horses'];
  const randomTags = {
    Views: ['links', 'requests', 'refreshes'],
    Posts: ['created', 'edited', 'deleted'],
    Users: ['new', 'existing', 'banned'],
    Responses: ['likes', 'dislikes', 'blocks'],
    Horses: ['Ed', 'Trigger', 'BoJack']
  };
  const randomValues = {
    links: ['blah', 'hey'],
    request: ['blah'],
    refreshes: 10000,
    new: 1000,
    existing: 100000,
    banned: 200,
    likes: 1000,
    dislikes: 1000,
    blocks: 1000,
    Ed: ['a', 'talking', 'horse', 'of', 'course'],
    Trigger: ['not', 'a', 'talking', 'horse'],
    BoJack: ['a', 'man', 'and', 'a', 'horse']
  };

  const entries = [];
  for (var i = 0; i < numEntries; i++) {
    // random type:
    const cur = { type: _.sample(randomTypes), tags: {} };
    // up to 3 keys, may override a previous key:
    for (var j = 0; j < _.random(3); j++) {
      const key = _.sample(randomTags[cur.type]);
      // each tag value is either one item randomly picked from a list or a random number:
      cur.tags[key] = typeof randomValues[key] === 'number' ? _.random(randomValues[key]) : _.sample(randomValues[key]);
    }
    cur.value = _.random(1, 10);
    cur.createdOn = getRandomDate();
    cur.tagKeys = Object.keys(cur.tags);
    entries.push(cur);
  }
  // now add them to db:
  this.plugins['hapi-mongodb'].db.collection('tracks').insertMany(entries, (err, result) => {
    return callback(err, result);
  });
};
