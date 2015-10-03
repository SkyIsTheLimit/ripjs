// Load the RIP Engine.
var RIP = require('../../lib/rip');
var logger = RIP.Logger;
var Q = require('q');

// Load the app configuration.
var configuration = require('./rip.conf.js');

// Intialize.
Q.fcall(function() {
    return RIP.create(configuration);
}).then(function(application) {
    return RIP.run(application);
});
