var fs = require('fs'),
    util = require('util'),

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

function cacheFeed(feed) {
  var cacheFile = __dirname.replace("lib/hn", "public") + feed.route;
  feed.source.getJSON(function(json) {
    fs.writeFile(cacheFile, json);
  });
  setTimeout(function() {
    cacheFeed(feed);
  }, (feed.cacheDuration * 60 * 1000));
}

exports.updateFeedCaches = function() {
  FEEDS.forEach(function(feed, i) {
    cacheFeed(feed);
  });
};

if (!module.parent) {
  exports.updateFeedCaches();
}
