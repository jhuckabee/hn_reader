var natives = process.binding('natives'),
    name;

/**
 * Define property and require lazily native module.
 * Getter is removed after first access, so there is no performance overhead.
 * @param {String} name
 */
function define(name) {
    Object.defineProperty(
        exports,
        name,
        {
            enumerable : true,
            configurable : true,
            get: function() {
                // delete defined property to remove this getter
                delete exports[name];
                // redefine this property directly
                return exports[name] = require(name);
            }
        }
    );
}

for (name in natives) {
    define(name);
}
