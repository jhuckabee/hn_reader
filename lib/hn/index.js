var fs = require('fs');

var FEEDS = [
  {
    route: '/top.json',
    source: require('./feeds/top')(),
    cacheDuration: 3
  },
  {
    route: '/newest.json',
    source: require('./feeds/newest')(),
    cacheDuration: 1
  }
];


// Checks for the existence of a cache file, the cached file
// is servied if it it exists and has not expired according
// to the passed in cache expiration time
function useCachedFeed(cacheFile, cacheDuration) {
  return function(req, res, next) {
    fs.stat(cacheFile, function(err, stat) {
      // Cache miss or cache has expired, load it from RSS feed
      if((err && err.code === 'ENOENT') ||
         (stat.mtime.getTime() < ((new Date()).getTime() - (cacheDuration*1000*60)))) {
        next();
      }
      else {
        next('route')
      }
    });
  }
}

function setupFeedRoute(app, feed) {
  var cacheFile = app.set('public') + feed.route;
  app.get(feed.route, useCachedFeed(cacheFile, feed.cacheDuration), function(req, res, next){
    feed.source.getJSON(function(json) {
      res.contentType('application/json');
      res.send(json);
      fs.writeFile(cacheFile, json);
    });
  });
}

exports.setup = function(app) {
  FEEDS.forEach(function(feed, i) {
    setupFeedRoute(app, feed);
  });
};
