'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => {
  return setup.withRapptor({}, []);
});
tap.afterEach(async() => { await setup.stop(); });

tap.test('batch insert', async(t) => {
  const created = new Date();

  await setup.server.req.post('/api/track/batch', {
    payload: {
      events: [
        { type: 'test1', value: 1, tags: { tag1: '123' }, createdOn: created },
        { type: 'test1', value: 2, tags: { tag1: '123' }, createdOn: created },
        { type: 'test2', createdOn: created },
        { type: 'test3', value: 1, tags: 'tag2:value1', createdOn: created }
      ]
    }
  });
  const get = await setup.server.db.tracks.find({}).toArray();
  t.equal(get.length, 4);
  t.equal(get[0].type, 'test1');
  t.equal(get[1].type, 'test1');
  t.equal(get[2].type, 'test2');
  t.equal(get[3].type, 'test3');
  t.deepEqual(get[0].tagKeys, ['tag1']);
  t.deepEqual(get[1].tagKeys, ['tag1']);
  t.deepEqual(get[2].tagKeys, []);
  t.deepEqual(get[3].tagKeys, ['tag2']);
  t.deepEqual(get[3].tags, { tag2: 'value1' });
  t.equal(get[0].createdOn.getTime(), created.getTime());
  return t.end();
});
