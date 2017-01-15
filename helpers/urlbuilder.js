'use strict';
const querystring = require('querystring');
module.exports = function(options) {
  const obj = options.hash;
  const urlObj = {};
  if (obj.type) {
    urlObj.type = obj.type;
  }
  if (obj.tags) {
    urlObj.tags = obj.tags;
  }
  if (obj.last) {
    urlObj.last = obj.last;
  }
  if (obj.tagValue) {
    urlObj.tags = `${urlObj.tags}=${obj.tagValue}`;
  }
  const qs = querystring.stringify(urlObj);
  return `/ui?${qs}`;
};
