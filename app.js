
/**
 * Module dependencies.
 */

var express = require('express'),
    gzippo = require('gzippo'),
    assets = require('./lib/assets'),
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


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/intro', function(req, res) {
  res.render('intro');
});

app.get('/frame_unfriendly_host', function(req, res) {
  res.render('frame_unfriendly_host');
});

assets.setup(app);
hn.setup(app);

if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d", app.address().port);
}
