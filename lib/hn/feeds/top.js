var fs = require('fs'),
    libxmljs = require('libxmljs'),
    request = require('request'),
    NewsItem = require('../news_item').NewsItem;

function TopFeed(config) {
  this.config = config;
  this.cacheFile = './cache/top.json'
}

/*
 * Public API
 */

/*
 * Returns top news items as an object array
 */
TopFeed.prototype.get = function(next) {
  var that = this;

  that._isCached({
    yes: function() {
      // Load news items from cache
      that._fromCache(next);
    },
    no: function() {
      that._getItems(function(items) {
        that._respondWith(items, items, next);
      });
    }
  });
};

/*
 * Returns top news items as a JSON string
 */
TopFeed.prototype.getJSON = function(next) {
  var that = this;

  that._isCached({
    yes: function() {
      // Load news items from cache
      that._fromCache(next, 'json');
    },
    no: function() {
      that._getItems(function(items) {
        that._respondWith(JSON.stringify(items), items, next);
      });
    }
  });
};

/*
 * Private helper methods
 */

TopFeed.prototype._getItems = function(next) {
  var that = this;
  that._getRSSXML(function(rss) {
    that._itemsFromRSS(rss, function(newsItems) {
      next(newsItems);
    });
  });
};

TopFeed.prototype._getRSSXML = function(next) {
  request('http://news.ycombinator.com/rss', function(err, resp, body) {
    next(libxmljs.parseXmlString(body));
  });
};

TopFeed.prototype._itemsFromRSS = function(rss, next) {
  var newsItem, 
  newsItems = [];

  rss.find("//rss/channel/item").forEach(function(item) {
    newsItem = new NewsItem({
      title:        item.get('title').text(),
      link:         item.get('link').text(),
      comments:     item.get('comments').text()
    });
    newsItems.push(newsItem);
  });

  next(newsItems);
};

TopFeed.prototype._respondWith = function(toReturn, toCache, next) {
  next(toReturn);
  this._cache(toCache);
};

TopFeed.prototype._isCached = function(callbacks) {
  var that = this;
  fs.stat(that.cacheFile, function(err, stat) {
    // Cache miss or cache has expired, load it from RSS feed
    if((err && err.code === 'ENOENT') ||
       (stat.mtime.getTime() < ((new Date()).getTime() - (that.config.cache_expiration_time*1000*60)))) {
      callbacks.no();
    }
    else {
      callbacks.yes();
    }
  });
};

TopFeed.prototype._fromCache = function(next, returnAs) {
  var newsItem, 
  newsItems = [];

  fs.readFile(this.cacheFile, 'utf8', function(err, data) {
    if(returnAs === 'json') {
      next(data);
    }
    else {
      var items = JSON.parse(data)
      items.forEach(function(item) {
        newsItem = new NewsItem({
          title:        item.title,
          link:         item.link,
          comments:     item.comments
        });
        newsItems.push(newsItem);
      });
      next(newsItems);
    }
  });
};

TopFeed.prototype._cache = function(newsItems) {
  fs.writeFile(this.cacheFile, JSON.stringify(newsItems));
};

module.exports = function(config) {
  return new TopFeed(config);
}
