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
  const qs = querystring.stringify(urlObj);
  return `/ui?${qs}`;
};
