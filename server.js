var cluster = require('cluster'),
    hn = require('./lib/hn'),
    util = require('util');

cluster('./lib/app.js')
  .set('socket path', './tmp') 
  .in('development')
    .set('workers', 4)
    .listen(8000)
  .in('production')
    .set('workers', 4)
    .listen(80);
