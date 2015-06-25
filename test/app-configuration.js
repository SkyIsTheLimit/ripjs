var expect = require('chai').expect;

var RIP = require('../lib/rip');

var Fixtures = require('./fixtures');
var Configuration = require('./configuration');

describe(Configuration.title('Application Configuration'), function() {
    var configuration = {
        name: "Text Application",
        models: [ Fixtures.Mocks.Event ],
        db: {
            name: "testdb.json"
        }
    };

    // Create the application.
    beforeEach(Fixtures.createApplication(configuration));

    // Stop the application.
    afterEach(Fixtures.stopApplication());

    describe('As a user, I shall be able to provide the application name in the configuration of the RIP application.', function() {
        it('Should allow to specify application name in the configuration', function() {
            expect(application.name).not.to.equal(undefined);
            expect(application.name).to.equal(configuration.name);
        });
    });

    describe('As a user, I shall be able to specify the list of models for an application.', function() {
        // Run the application.
        beforeEach(Fixtures.runApplication());

        it('Should allow to specify a list of models in the configuration', function() {
            expect(application.models).not.to.equal(undefined);
            expect(application.models.length).to.equal(configuration.models.length);
        });
    });
});
