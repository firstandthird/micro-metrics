'use strict';

module.exports = (paramString) => {

  const day = new RegExp('(\\d+)(d)').exec(paramString);
  const hour = new RegExp('(\\d+)(h)').exec(paramString);
  const minute = new RegExp('(\\d+)(m)').exec(paramString);
  const hourValue = hour ? hour[1] : 0;
  const dayValue = day ? day[1] : 0;
  const minuteValue = minute ? minute[1] : 0;
  const thresholdTime = new Date().getTime();
  return thresholdTime - ((minuteValue * 60 * 1000) + (dayValue * 86400000) + (hourValue * 3600000));
};
