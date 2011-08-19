var fs = require('fs'),

    FEEDS = [
      {
        route: '/top.json',
        source: require('./feeds/top')(),
        cacheDuration: 5
      },
      {
        route: '/newest.json',
        source: require('./feeds/newest')(),
        cacheDuration: 2
      }
    ];

function cacheFeed(app, feed) {
  var cacheFile = app.set('public') + feed.route;
  feed.source.getJSON(function(json) {
    fs.writeFile(cacheFile, json);
  });
  setTimeout(function() {
    cacheFeed(app, feed);
  }, (feed.cacheDuration * 60 * 1000));
}

exports.setup = function(app) {
  FEEDS.forEach(function(feed, i) {
    cacheFeed(app, feed);
  });
};
