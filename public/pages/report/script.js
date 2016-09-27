/* global window */
const MG = require('metrics-graphics');
const d3 = require('d3');

const data = window._data.map((item) => ({ // eslint-disable-line no-underscore-dangle
  date: new Date(item.createdOn),
  value: item.value || 1
}));

MG.data_graphic({
  title: 'Report',
  data,
  full_width: true,
  height: 400,
  colors: ['#009688'],
  target: '#report', // the html element that the graphic is inserted in
  x_accessor: 'date',  // the key that accesses the x value
  y_accessor: 'value',
  interpolate: d3.curveLinear,
  area: false,
  missing_is_zero: true,
  legend: window._legend //eslint-disable-line no-underscore-dangle
});
