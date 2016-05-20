var expect = require('chai').expect;

var RIP = require('../lib/rip');

var Fixtures = require('./fixtures');
var Configuration = require('./configuration');

xdescribe(Configuration.title('Application Startup'), function() {
    describe('As a user, I shall be able to run the application from code using the RIP object in NodeJS ( by executing RIP.run(ripApp) )', function() {
        // Create the application.
        beforeEach(Fixtures.createApplication());
        
        // Run the application.
        beforeEach(function() {
            return RIP.run(application);
        });
        
        afterEach(Fixtures.stopApplication());
        
        it('Should start the application and change it\'s state to started', function() {
            // Check the application status.
            expect(application.status).to.equal("started");
        });

        it('Should have an empty list of models', function() {
            // Check if we have an empty list of models for the application.
            expect(application.models).not.to.equal(undefined);
            expect(application.models).to.be.empty;
        });

        it('Should have an empty list of endpoints', function() {
            // Check if we have an empty list of endpoints too.
            expect(application.endpoints).not.to.equal(undefined);
            expect(application.endpoints).to.be.empty;
        });
    });
});
