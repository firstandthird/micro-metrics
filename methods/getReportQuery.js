module.exports = function(query) {
  const server = this;
  const findObj = {};

  if (query.last) {
    query.startDate = server.methods.extractStartDate(query.last);
    query.endDate = new Date().getTime();
  }

  if (query.type) {
    findObj.type = query.type;
  }

  if (query.tags) {
    const tagObj = server.methods.stringToKeyValue(query.tags);
    Object.keys(tagObj).forEach((tag) => {
      const value = tagObj[tag];
      findObj[`tags.${tag}`] = (value === true) ? { $exists: 1 } : value;
    });
  }

  if (query.fields) {
    const fields = server.methods.stringToKeyValue(query.fields);
    Object.keys(fields).forEach((field) => {
      const value = fields[field];
      findObj[`fields.${field}`] = (value === true) ? { $exists: 1 } : value;
    });
  }

  if (query.startDate && query.endDate) {
    findObj.createdOn = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate)
    };
  }

  if (query.value) {
    findObj.value = (isNaN(query.value / 1)) ? query.value : query.value / 1;
  }
  return findObj;
};
