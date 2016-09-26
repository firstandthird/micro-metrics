const querystring = require('querystring');
module.exports = function(options) {
  const obj = options.hash;
  const urlObj = {};
  if (obj.type) {
    urlObj.type = obj.type;
  }
  if (obj.tag) {
    urlObj.tag = obj.tag;
  }
  if (obj.last) {
    urlObj.last = obj.last;
  }
  const qs = querystring.stringify(urlObj);
  return `/ui?${qs}`;
};
