var cluster = require('cluster'),
    util = require('util');

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork();
  });
} else {
  var app = require('./lib/app.js');
  app.listen(8000);
}
