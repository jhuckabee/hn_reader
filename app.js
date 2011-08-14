
/**
 * Module dependencies.
 */

var express = require('express'),
    gzippo = require('gzippo'),
    hn = require('./lib/hn');

var app = module.exports = express.createServer(),
    PORT;

// Configuration

app.configure(function(){
  app.set('public', __dirname + '/public');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(gzippo.staticGzip(app.set('public'), {
    contentTypeMatch: /text|javascript/
  }));
});

app.configure('development', function(){
  PORT = 8000;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  PORT = 80;
  app.use(express.errorHandler()); 
});

hn.setup(app);

if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d", app.address().port);
}
