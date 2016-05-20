var expect = require('chai').expect;

var RIP = require('../lib/rip');

var Fixtures = require('./fixtures');
var Configuration = require('./configuration');

xdescribe(Configuration.title('Application Shutdown'), function() {
    describe('As a user, I shall be able to stop the application from code using the RIP object in NodeJS ( by executing RIP.stop(ripApp) )', function() {
        // Create the application.
        beforeEach(Fixtures.createApplication());

        // Run the application.
        beforeEach(Fixtures.runApplication());

        // Stop the application.
        beforeEach(Fixtures.stopApplication());
        
        afterEach(Fixtures.stopApplication());

        it('Should stop the application and change it\'s state to stopped', function() {
            // Check the application status.
            expect(application.status).to.equal("stopped");
        });

        it('Should still have an empty list of models', function() {
            // Check if we have an empty list of models for the application.
            expect(application.models).not.to.equal(undefined);
            expect(application.models).to.be.empty;
        });

        it('Should still have an empty list of endpoints', function() {
            // Check if we have an empty list of endpoints too.
            expect(application.endpoints).not.to.equal(undefined);
            expect(application.endpoints).to.be.empty;
        });
    });
});
