module.exports = {
  method(str) {
    if (!str) {
      return {};
    }
    //already an object?
    if (typeof str === 'object') {
      return str;
    }
    const split = str.split(',');
    const obj = {};

    split.forEach((item) => {
      const arr = item.split(':');
      if (arr.length === 1) {
        arr.push(true);
      }
      obj[arr[0]] = arr[1];
    });
    return obj;
  },
};
