'use strict';

const _ = require('lodash');

module.exports = {
  method(filter, done) {
    const server = this;
    const db = server.plugins['hapi-mongodb'].db;

    const findObj = {};

    if (filter.last) {
      filter.startDate = server.methods.extractStartDate(filter.last);
      filter.endDate = new Date().getTime();
    }

    if (filter.type) {
      findObj.type = filter.type;
    }

    if (filter.tags) {
      const allTags = filter.tags.split(',');
      _.each(allTags, (tag) => {
        const tagArr = tag.split('=');
        findObj[`tags.${tagArr[0]}`] = (tagArr.length === 1) ? { $exists: 1 } : tagArr[1];
      });
    }
    if (filter.startDate && filter.endDate) {
      findObj.createdOn = {
        $gte: new Date(filter.startDate),
        $lte: new Date(filter.endDate)
      };
    }

    if (filter.value) {
      findObj.value = (isNaN(filter.value / 1)) ? filter.value : filter.value / 1;
    }

    db.collection('tracks').find(findObj).toArray(done);
  }
};
