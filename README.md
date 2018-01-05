# micro-metrics [![Build Status](https://travis-ci.org/firstandthird/micro-metrics.svg?branch=master)](https://travis-ci.org/firstandthird/micro-metrics) [![Coverage Status](https://coveralls.io/repos/github/firstandthird/micro-metrics/badge.svg?branch=master)](https://coveralls.io/github/firstandthird/micro-metrics?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/firstandthird/micro-metrics.svg)](https://greenkeeper.io/)
## a microservice metrics api server using docker



#### API Routes
- **_/api/track_** (POST)

  Create a new metric to track. Payload must be a JSON packet, can have the following params:
   - **type** _(required)_ the name of the metric type you want to track
   - **tags** an object in which the keys are the tag name and the values the associated value for that tag
   - **value** the value of the metric. Can be any valid JSON type (string, number, object, array, etc). The default value is the number 1.
   - **data** any data you want to store about this metric. Can be any JSON type.
   - **userID** a string name indicating which user to associate this metric with

   (see tests for examples)

- **_/api/report?filter1=filter1value&filter2=filter2value..._** (GET)

   Search the tracked metrics to get a list of matching metrics. Filters can include any of the following:

    - **type** retrieves all metrics of the indicated type
    - **tags** a comma-separated list of tag queries. Each query can be either a tag name or a tag name=value pair. If just a tag name, it will retrieve all metrics with a tag of that name, regardless of the tag's value. If you pass a name=value pair, it will retrieve only the metrics with that tag name for which the value also matches.
    - **startDate/endDate** a Javascript-parseable Date string, limiting the metrics returned by the maximum/minimum date of creation  
    - **value** retrieve all metrics with the indicated value

- **_/api/tags?filter1=filter1value&filter2=filter2value..._** (GET)

  Search the metric database for matching metrics, and return all tags names and a corresponding list of all values for that tag name for the matching metrics. Metric filters can be any field that was passed in the payload for _/api/track_. Result will be a JSON object like so:
  ```
  {
    tagName1: ['tagValue1','tagValue2'],
    tagName2: ['tagValue1', 'tagValue3', 'tagValue4']
  }
  ```

- **_/api/types_** (GET)

Returns a list of all the metric types in the database. 


#### Tracking Pixel

To track via tracking pixel, you can set an image into an app / email that you would like to track with the data appended as a query string.

```
<img src="/t.gif?type=pageview&tags=tag1,tag2&userId=99" />
```

To use tags with a `var` `val` notation, structure the tags portion of the string like this.

```
tags=var1=val1,var2=val2,var3=val3
```
