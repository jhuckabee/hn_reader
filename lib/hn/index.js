var config = {
  cache_expiration_time: 3 // Minutes to keep news items cached
}

exports.topFeed = require('./feeds/top')(config);
