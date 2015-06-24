var RIP = require('../lib/rip');

// The configuration object used for creating the application.
var configuration = {
    name: "Test Application",
    db: {
        name: "testdb.json",
        create: false,
        load: false
    }
};

// Current time.
var now = new Date(9999999999);

// The RIP application.
var application;

var configure = function(_configuration_) {
    if(typeof _configuration_ !== 'undefined') {
        configuration = _configuration_;
    }

    return configuration;
};

var createApplication = function(_configuration_) {
    return function() {
        // Create a new application. Pass in the configuration.
        return RIP.create(_configuration_ || configuration).then(function(_application_) {
            application = this.application = _application_;
        });
    };
};

var runApplication = function() {
    return function() {
        return RIP.run(application);
    };
};

var stopApplication = function() {
    return function() {
        return RIP.stop(application);
    };
};

// Function to return a timestamp at a number of milliseconds from now.
var getTimestampFromNow = function(difference) {
    return now.getTime() - difference;
};

// Method to generate events for the last 24 hours.
// Generates events at the boundaries of 24 hours back.
var generateEvents = function() {
    // The list of events.
    var events = [];

    // Test Email.
    var email = 'test@test.com';

    // First, let's create events at the boundaries.

    // Time 24 Hours Before Now.
    var twentyFourHoursBack = getTimestampFromNow(24 * 60 * 60 * 1000);

    // Add an event 24 hours back.
    events.push({
        email: email,
        when: twentyFourHoursBack
    });

    // Add one millisecond before 24 hours back.
    events.push({
        email: email,
        when: twentyFourHoursBack - 1
    });

    // Add one millisecond after 24 hours back.
    events.push({
        email: email,
        when: twentyFourHoursBack + 1
    });

    // Next, let's create events for the last 24 hours.
    // Add 100 events every one hour for the last 24 hours. Total 2400 events.
    for(var hour = 1; hour <= 24; hour++) {
        for(event = 1; event <= 100; event++) {
            events.push({
                email: email,
                when: getTimestampFromNow(((24 - hour) * 60 * 60 * 1000) + event * 100)
            });
        }
    }

    // Finally return the list of events.
    return events;
};

// The Event Class
var Event = {
    name: 'Event',
    attributes: {
        email: {
            'id': true,
            'required': true,
            'default': 'admin@host.com'
        },
        when: {
            'required': true,
            'autogenerate': true,
            'generator': function() {
                return new Date();
            }
        }
    }
};

// A list of mock events.
// var events = [];

// Generate the list of mock events.
// events = generateEvents();

// Mock Event 1
var event1 = {
    email: 'test1@test.com',
    when: getTimestampFromNow(10 * 60 * 60 * 1000) // 10 Hours Back
};

// Mock Event 2
var event2 = {
    email: "test2@test.com",
    when: getTimestampFromNow(12 * 60 * 60 * 1000) // 12 Hours Back
};

// Helper functions
var Helpers = {
    getTimestampFromNow: getTimestampFromNow
};

// Mocks
var Mocks = {
    Event: Event,
    // events: events,
    event1: event1,
    event2: event2
};

module.exports = {
    configuration: configure,
    createApplication: createApplication,
    runApplication: runApplication,
    stopApplication: stopApplication,
    generateEvents: generateEvents,
    getTimestampFromNow: getTimestampFromNow,
    Helpers: Helpers,
    Mocks: Mocks
};
