var url = require('url');

function NewsItem(defaults) { 
  defaults          = defaults              || {};
  this.itemId       = defaults.itemId       || 0;
  this.title        = defaults.title        || '';
  this.link         = defaults.link         || '';
  this.comments     = defaults.comments     || '';
  this.voteCount    = defaults.voteCount    || 0;
  this.commentCount = defaults.commentCount || 0;
  this.host         = this.link === '' ? '' : url.parse(this.link).host;
};

NewsItem.prototype.publicJSON = function() {
  return {
    itemId: this.itemId,
    title: this.title,
    link: this.link,
    comments: this.commentLink(),
    voteCount: this.voteCount,
    commentCount: this.commentCount,
    host: this.host
  };
};

NewsItem.prototype.print = function() {
  console.log(this.title);
  console.log(this.link);
  console.log('');
};

NewsItem.prototype.commentLink = function() {
  return this.comments || 'http://news.ycombinator.com/item?id='+this.itemId;
};

exports.NewsItem = NewsItem;
