'use strict';
const Parser = require('json2csv').Parser;

module.exports = {
  method(content, fields) {
    const options = { doubleQuotes: "'", flatten: true };
    if (fields) {
      options.fields = fields;
    }
    const parser = new Parser(options);
    return parser.parse(content);
  }
};
