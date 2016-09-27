const Handlebars = require('handlebars');
module.exports = function(input, pretty) {
  if (typeof input === 'undefined') {
    return '';
  }
  const spaces = (pretty) ? 2 : 0;
  return new Handlebars.SafeString(JSON.stringify(input, null, spaces));
};
