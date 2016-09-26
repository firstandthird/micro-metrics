/* global window */
const MG = require('metrics-graphics');

const data = [];
window._data.forEach((dataSet) => { // eslint-disable-line no-underscore-dangle
  data.push(dataSet.map((item) => ({
    date: new Date(item.createdOn),
    value: item.value || 1
  })));
});

MG.data_graphic({
  title: 'Report',
  data,
  full_width: true,
  height: 400,
  colors: ['#009688'],
  target: '#report', // the html element that the graphic is inserted in
  x_accessor: 'date',  // the key that accesses the x value
  y_accessor: 'value',
  legend: window._legend //eslint-disable-line no-underscore-dangle
});
