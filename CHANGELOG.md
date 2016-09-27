
0.6.0 / 2016-09-27
==================

  * support for filtering by tag values
  * auto aggregate based on last query duration
  * added datatable
  * removed multiple lines on a single chart
  * aggregate support
  * stringify helper - if no input, just return blank string
  * report endpoint support for querying by tag values
  * fixed tags in report. set 0 if no data

0.5.1 / 2016-09-26
==================

  * default to 24h report
  * removed external helpers

0.5.0 / 2016-09-25
==================

  * allows /api/generate
  * /api/report/?last=
  * report ui
  * update dev config
  * updated depedencies

0.4.0 / 2016-09-17
==================

  * removed unneeded yaml file
  * updated tags to store/use the tagKeys field
  * Create README.md

0.3.0 / 2016-07-01
==================

  * added test conf, set port for tests
  * renamed get to report
  * updated test conf
  * added run script
  * updated default config to reuse mongo url
  * removed unneeded dev packages
  * lint fixes, checked against docker
  * uses rapptor for tests, tests against a local mongo server

0.2.0 / 2016-06-24
==================

  * tag update, package.json dev deps
  * handles tags as objects
  * added tests, /api/types and /api/tags
