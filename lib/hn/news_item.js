var url = require('url');

function NewsItem(defaults) { 
  this.title    = defaults.title    || '';
  this.link     = defaults.link     || '';
  this.comments = defaults.comments || '';
  this.host     = this.link === '' ? '' : url.parse(this.link).host;
};

NewsItem.prototype.print = function() {
  console.log(this.title);
  console.log(this.link);
  console.log('');
}

exports.NewsItem = NewsItem;
