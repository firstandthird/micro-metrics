'use strict';

module.exports = {
  method(content) {
    return `
    <table>\n
      <tr> <th>Date</th> <th>Avg</th> <th>Max</th> <th>Min</th> </tr>\n
      ${content.map(row => `<tr> <td>${row.dateString}</td> <td>${row.avg}</td> <td>${row.max}</td> <td>${row.min}</td> </tr>`).join('')}\n
    </table>`;
  }
};
