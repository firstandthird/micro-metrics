'use strict';

const getDaysAndHours = (paramString) => {
  const day = new RegExp('(\\d+)(d)').exec(paramString);
  const hour = new RegExp('(\\d+)(h)').exec(paramString);
  const retObj = {};
  if (hour) {
    retObj.hour = hour[1];
  }
  if (day) {
    retObj.day = day[1];
  }
  return retObj;
};

exports.report = {
  method: 'GET',
  path: '/api/report/{last?}',
  handler(request, reply) {
    const query = request.query;
    if (request.params.last) {
      const obj = getDaysAndHours(request.params.last);
      let thresholdTime = new Date().getTime();
      if (obj.day) {
        thresholdTime -= (obj.day * 86400000);
      }
      if (obj.hour) {
        thresholdTime -= (obj.hour * 3600000);
      }
      query.startDate = thresholdTime;
      query.endDate = new Date().getTime();
    }
    request.server.methods.get(query, (err, results) => {
      if (err) {
        request.server.log(err);
        return reply(err).code(404);
      }
      reply({
        count: results.length,
        results
      });
    });
  }
};
