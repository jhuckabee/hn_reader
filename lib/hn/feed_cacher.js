var fs = require('fs'),
    util = require('util'),

    FEEDS = [
      {
        route: '/top.json',
        source: require('./feeds/top'),
        cacheDuration: (5*60*1000),
        timerId: null
      },
      {
        route: '/newest.json',
        source: require('./feeds/newest'),
        cacheDuration: (2*60*1000),
        timerId: null
      }
    ];

function cacheFeed(feed) {
  clearTimeout(feed.timerId);
  var cacheFile = __dirname.replace("lib/hn", "public") + feed.route,
      feedCache = new feed.source();

  feedCache.getJSON(function(json) {
    fs.writeFile(cacheFile, json, 'utf8', function(err) {
      feedCache = cacheFile = json = err = null;
      feed.timerId = setTimeout(cacheFeed, feed.cacheDuration, feed);
    });
  });
}

exports.updateFeedCaches = function() {
  FEEDS.forEach(function(feed, i) {
    cacheFeed(feed);
  });
};

if (!module.parent) {
  exports.updateFeedCaches();
}
