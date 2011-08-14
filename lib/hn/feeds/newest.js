var util = require('util'),
    libxmljs = require('libxmljs'),
    request = require('request'),
    Feed = require('../feed').Feed;
    NewsItem = require('../news_item').NewsItem;

function NewestFeed() {
  Feed.call(this);
}
util.inherits(NewestFeed, Feed);

NewestFeed.prototype._getItems = function(next) {
  var that = this;
  that._getPage(function(xml) {
    that._itemsFromHTML(xml, function(newsItems) {
      next(newsItems);
    });
  });
};

NewestFeed.prototype._getPage = function(next) {
  request('http://news.ycombinator.com/newest', function(err, resp, body) {
    next(libxmljs.parseHtmlString(body));
  });
};

NewestFeed.prototype._itemsFromHTML = function(xml, next) {
  var newsItem, 
      subtext,
      commentCount,
      newsItems = [];

  xml.find("/html/body/center/table/tr[3]/td/table/tr/td[3]").forEach(function(item) {
    newsItem = new NewsItem({
      title: item.get('a').text(),
      link: item.get('a').attr('href').value(),
    });

    subtext = item.parent().nextSibling().get('td[2]');
    newsItem.itemId = subtext.get('span').attr('id').value().split('_')[1];
    newsItem.voteCount = parseInt(subtext.get('span').text().split(' ')[0], 10);
    commentCount = subtext.get('a[2]').text().split(' ');
    newsItem.commentCount = (commentCount.length > 1 ? parseInt(commentCount[0], 10) : 0);

    newsItems.push(newsItem);
  });

  next(newsItems);
};

module.exports = function() {
  return new NewestFeed();
}
