const Handlebars = require('handlebars');
module.exports = function(input, pretty) {
  const spaces = (pretty) ? 2 : 0;
  return new Handlebars.SafeString(JSON.stringify(input, null, spaces));
};
