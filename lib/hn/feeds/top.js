var util = require('util'),
    libxmljs = require('libxmljs'),
    request = require('request'),
    Feed = require('../feed').Feed;
    NewsItem = require('../news_item').NewsItem;

function TopFeed() {
  Feed.call(this);
}
util.inherits(TopFeed, Feed);

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

module.exports = function() {
  return new TopFeed();
}
