
/**
 * Module dependencies.
 */

var fs = require('fs'),
    express = require('express'),
    hn = require('./lib/hn');

var app = module.exports = express.createServer(),
    PORT;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  PORT = 8000;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  PORT = 80;
  app.use(express.errorHandler()); 
});

// Routes

app.get('/top.json', function(req, res, next){
  fs.stat('./public/top.json', function(err, stat) {
    // Cache miss or cache has expired, load it from RSS feed
    if((err && err.code === 'ENOENT') ||
       (stat.mtime.getTime() < ((new Date()).getTime() - (3*1000*60)))) {
      console.log('yoyoyuoyo');
      hn.topFeed.getJSON(function(json) {
        res.contentType('application/json');
        res.send(json);
        fs.writeFile('./public/top.json', json);
      });
    }
    else {
      next();
    }
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d", app.address().port);
}