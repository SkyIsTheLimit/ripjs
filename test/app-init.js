var expect = require('chai').expect;

var RIP = require('../lib/rip');

var Fixtures = require('./fixtures');
var Configuration = require('./configuration');

describe(Configuration.title('Application Initialization'), function() {
    // Create the application.
    beforeEach(Fixtures.createApplication());

    describe('As a user, I shall be able to create a new instance of a RIP application from the code in NodeJS.', function() {
        it('Should allow to create a new application', function() {
            expect(application).not.to.equal(undefined);
        });
    });
});
