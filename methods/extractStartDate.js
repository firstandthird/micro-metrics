'use strict';

module.exports = (paramString) => {
  const day = new RegExp('(\\d+)(d)').exec(paramString);
  const hour = new RegExp('(\\d+)(h)').exec(paramString);
  const minute = new RegExp('(\\d+)(m)').exec(paramString);
  const hourValue = hour ? hour[1] : 0;
  const dayValue = day ? day[1] : 0;
  const minuteValue = minute ? minute[1] : 0;
  const today = new Date();
  if (hourValue === 0 && minuteValue === 0) {
    today.setHours(0, 0, 0, 0);
  } else {
    today.setSeconds(0, 0);
  }
  const thresholdTime = today.getTime();
  return thresholdTime - ((minuteValue * 60 * 1000) + (dayValue * 86400000) + (hourValue * 3600000));
};
