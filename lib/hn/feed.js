function Feed() { }

/*
 * Public API
 */

/*
 * Returns top news items as an object array
 */
Feed.prototype.get = function(next) {
  var that = this;
  this._getItems(function(items) {
    next(that._publicJSON(items));
    items = null;
  });
};

/*
 * Returns top news items as a JSON string
 */
Feed.prototype.getJSON = function(next) {
  var that = this;
  this._getItems(function(items) {
    next(JSON.stringify(that._publicJSON(items)));
    items = null;
  });
};

/*
 * This method must be overriden in subclasses
 */
Feed.prototype._getItems = function(next) {
  throw new Error("Must be implmeneted in a sub class.");
};

Feed.prototype._publicJSON = function(items) {
  return items.map(function(item) {
    return item.publicJSON();
  });
};

exports.Feed = Feed;
