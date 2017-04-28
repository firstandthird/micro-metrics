'use strict';
const csv = require('json2csv');

module.exports = {
  method(content) {
    return csv({ data: content, doubleQuotes: "'", flatten: true });
  }
};
