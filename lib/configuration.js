/**
 * Configuration Manager
 *
 * The Configuration Manager is responsible for managing multiple configurations
 * used with the RIP engine. This can be very useful when we want to host multiple
 * RIP applications which might want to share configuration data.
 *
 * @author Sandeep Prasad <s3g007@gmail.com>
 *
 */

var _ = require('underscore');

// The configuration data.
var data = {};

// Instance
var instance = {
    // The current configuration.
    current: {}
};

// Defaults
var defaults = {
    name: 'default',
    db: {
        name: 'test',
        type: 'mem'
    }
};

// Constructor to instantiate a new configuration.
var Configuration = function(name, configuration) {
    // Initialize with the defaults.
    _.defaults(configuration, defaults, true);

    // Add to data.
    data[name] = configuration;

    // Set it as the current configuration.
    _.extend(instance.current, data[name]);
};

// Static methods on the Configuration class.
var staticMethods = {
    // Returns the configuration object specified by the name.
    get: function(name) {
        return data[name];
    },

    // Returns the current configuration object.
    current: function() {
        return instance.current;
    }
};

// Export the Configuration class.
module.exports = _.extend(Configuration, staticMethods);
