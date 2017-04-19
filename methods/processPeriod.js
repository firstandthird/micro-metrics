module.exports = function(originalDate, period) {
  const date = new Date(originalDate);

  if (period === 'm' || period === 'h' || period === 'd') {
    date.setSeconds(0, 0);
  }

  if (period === 'h' || period === 'd') {
    date.setMinutes(0);
  }

  if (period === 'd') {
    date.setHours(0);
  }
  return date;
};
