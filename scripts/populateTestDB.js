'use strict';
// this script is used for testing, run this against your local test db to populate it with test data
// and then run updateTagKeys.js against it and see how it goes:
const Rapptor = require('rapptor');
const _ = require('lodash');

const populationSize = 10000;
const makeRandomObject = () => {
  const types = ['UserAccount', 'BankAccount', 'Metadata', 'Image', 'Posting'];
  const tagKeys = ['currency', 'name', 'datum', 'weight', 'size'];
  const userId = ['Montgomery Burns', 'JR Ewing', 'Daniel Plainview'];
  const obj = {
    type: _.sample(types),
    value: Math.random(),
    data: Math.random(),
    userId: _.sample(userId)
  };
  // add up to 5 tags:
  const tagCount = Math.round(5 * Math.random());
  obj.tags = {};
  for (let i = 0; i < tagCount; i++) {
    obj.tags[_.sample(tagKeys)] = Math.random();
  }
  return obj;
};

// initialize and run a rapptor:
const rapptor = new Rapptor({});
rapptor.start((err, server) => {
  if (err) {
    return console.log(err);
  }
  const db = server.plugins['hapi-mongodb'].db.collection('tracks');
  const allObjects = [];
  for (let i = 0; i < populationSize; i++) {
    allObjects.push(makeRandomObject());
  }
  db.insertMany(allObjects);
  console.log('done!')
});
