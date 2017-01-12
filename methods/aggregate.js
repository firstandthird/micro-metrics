'use strict';
const _ = require('lodash');

const processPeriod = function(date, period) {
  if (!date instanceof Date) {
    date = new Date(date);
  }

  if (period === 'm' || period === 'h' || period === 'd') {
    date.setSeconds(0, 0);
  }

  if (period === 'h' || period === 'd') {
    date.setMinutes(0);
  }

  if (period === 'd') {
    date.setHours(0);
  }
  return date;
};

module.exports = {
  method(dataset, period, allDone) {
    let grouped = _.groupBy(dataset, (item) => processPeriod(item.createdOn, period));
    grouped = _.mapValues(grouped, (items) => _.sumBy(items, 'value'));
    const out = [];
    _.forIn(grouped, (value, date) => {
      out.push({
        createdOn: date,
        value
      });
    });
    allDone(null, out);
  }
};
