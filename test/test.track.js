'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(() => setup.stop());

tap.test('can call the track route', async(t) => {
  t.notEqual(setup.server, null);
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType'
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.equal(typeof new Date(result.createdOn).getTime(), 'number');
  t.end();
});

tap.test('pass tags as string', async(t) => {
  t.notEqual(setup.server, null);
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType',
      tags: 'tag1:value1'
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.deepEqual(result.tags, { tag1: 'value1' });
  t.deepEqual(result.tagKeys, ['tag1']);
  t.equal(typeof new Date(result.createdOn).getTime(), 'number');
  t.end();
});

tap.test('pass data as string', async(t) => {
  t.notEqual(setup.server, null);
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType',
      data: 'key1:value1,key2:value2'
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.deepEqual(result.data, { key1: 'value1', key2: 'value2' });
  t.end();
});

tap.test('pass tags as object', async(t) => {
  t.notEqual(setup.server, null);
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType',
      tags: { tag1: 'value1' }
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.deepEqual(result.tags, { tag1: 'value1' });
  t.deepEqual(result.tagKeys, ['tag1']);
  t.equal(typeof new Date(result.createdOn).getTime(), 'number');
  t.end();
});

tap.test('pass data as object', async(t) => {
  t.notEqual(setup.server, null);
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType',
      data: { key1: 'value1' }
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.deepEqual(result.data, { key1: 'value1' });
  t.equal(typeof new Date(result.createdOn).getTime(), 'number');
  t.end();
});

tap.test('can pass in a custom timestamp for createdOn', async(t) => {
  t.notEqual(setup.server, null);
  const val = new Date().getTime() - 1000;
  const result = await setup.server.req.post('/api/track', {
    payload: {
      type: 'aType',
      createdOn: new Date(val)
    }
  });
  t.equal(result.value, 1);
  t.equal(result.type, 'aType');
  t.equal(new Date(result.createdOn).getTime(), val);
  t.end();
});
tap.test('can use /t.gif route to get a tracking pixel', async(t) => {
  const response = await setup.server.inject({
    url: '/t.gif?type=thisType&data=key1:value1,key2:value2&tags=tag1:value1,tag2:value2',
    method: 'GET',
  });

  t.equal(response.statusCode, 200);
  t.equal(response.headers['content-type'], 'image/gif');

  const track = await setup.server.db.tracks.findOne({ type: 'thisType' });
  t.equal(track.type, 'thisType');
  t.equal(track.data.ip, '127.0.0.1');
  t.equal(track.data.userAgent, 'shot');
  t.equal(track.data.key1, 'value1');
  t.equal(track.data.key2, 'value2');
  t.equal(track.tags.tag1, 'value1');
  t.equal(track.tags.tag2, 'value2');
  t.end();
});
