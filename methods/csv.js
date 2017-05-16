'use strict';
const csv = require('json2csv');

module.exports = {
  method(content, fields) {
    const options = { data: content, doubleQuotes: "'", flatten: true };
    if (fields) {
      options.fields = fields;
    }
    return csv(options);
  }
};
