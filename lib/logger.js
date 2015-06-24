/**
 * Logger
 *
 * Logger used for this project. This can be interesting to develop as the capabilities
 * developed here can be exposed outside to the consumer of the code. What that would mean
 * is that if we can have all the RIP consumers also use the same logger.
 *
 * @author Sandeep Prasad <s3g007@gmail.com>
 *
 */

var _ = require('underscore');

// Retrieve the current configuration.
var configuration = require('./configuration').current();

// Adding some colors to the console.
var colors = require('colors/safe');

// Define the console theme
var theme = {
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
};

// Map the theme labels to display labels that will be displayed on the console.
var labels = {
    silly: 'info',
    input: 'info',
    verbose: 'info',
    prompt: 'info',
    info: 'info',
    data: 'info',
    help: 'info',
    warn: 'warn',
    debug: 'debug',
    error: 'error'
};

// Set the theme.
colors.setTheme(theme);

// Instantiate the logger object.
var logger = {};

// Object to store the log data.
var data = {};

// Options for the logger.
var options = {
    // Append new line after every log.
    newLine: true,

    // Show timestamps with every log.
    showTimestamps: true,

    // Custom labels for the different theme labels.
    labels: {}
};

// Override the labels if required.
_.extend(labels, options.labels);

// Create the generic log function.
logger.log = function() {
    // Check if logging is disabled.
    if(!configuration.logging) {
        return;
    }

    // The first paramater passed should be the level of logging.
    var level = Array.prototype.shift.call(arguments).toLowerCase();

    // Get the label for this level.
    var label = labels[level];

    // Timestamp for the event.
    var when = new Date();

    // Append the display label for the level to the arguments.
    Array.prototype.unshift.call(arguments, '[' + label.toUpperCase() + '] ');

    // Create the entire message to be displayed.
    var message = Array.prototype.join.call(arguments, ' ');

    // Check if we want to show timestamps.
    if(options.showTimestamps) {
        message += '\n' + when;
    }

    // Check if we want to append new line.
    if(options.newLine) {
        message += '\n';
    }

    // Instantiate the data for this level if not done so already.
    data[level] = data[level] || [];

    // Add the log entry.
    data[level].push({
        // The log message.
        message: message,
        // When did it happen.
        timestamp: when
    });

    // And finally, use console.log of course :)
    console.log.call(console, colors[level](message));
};

// Function to create helper functions for the different levels in the application.
var createLevel = function(state) {
    logger[state] = function() {
        Array.prototype.unshift.call(arguments, state.toLowerCase());

        logger.log.apply(console, arguments);
    };
};

// Call the helper function and create the different logger levels.
for(var state in theme) {
    // Call the helper.
    createLevel(state);
}

// Hold the options in the logger object.
logger.options = options;

// Export the logger.
module.exports = logger;
