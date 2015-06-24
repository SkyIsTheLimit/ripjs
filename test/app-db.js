var _ = require('underscore');

var expect = require('chai').expect;

var Q = require('q');

var Fixtures = require('./fixtures');
var Configuration = require('./configuration');

describe(Configuration.title('Application Database'), function() {
    // The Event Model Class
    var Event;

    // Mock Events
    var event1, event2, events;

    describe('As a user, I shall be able to use a RIP application without configuring a DB but still have a default DB configured.', function() {
        describe('Creation of Data', function() {
            // Create the application.
            beforeEach(Fixtures.createApplication());

            // Initialize the mocks.
            beforeEach(function() {
                Event = application.model(Fixtures.Mocks.Event);

                // Set the ID attribute.
                Event.set('id.attribute', '$loki');

                event1 = Fixtures.Mocks.event1;
                event2 = Fixtures.Mocks.event2;
                events = Fixtures.Mocks.events;
            });

            afterEach(Fixtures.stopApplication());

            it('Should allow to insert an object in a data model using the insert function.', function() {
                return Event.insert(event1).then(function(event) {
                    expect(event.email).to.equal(event1.email);
                    expect(event.when).to.equal(event1.when);
                });
            });

            it('Should allow to insert an object in a data model using the save function.', function() {
                return Event.save(event1).then(function(event) {
                    expect(event.email).to.equal(event1.email);
                    expect(event.when).to.equal(event1.when);
                });
            });

            it('Should allow to insert an object in a data model using the create and save function.', function() {
                return Event.create(event1).then(function(event) {
                    return event.save();
                }).then(function(event) {
                    expect(event.email).to.equal(event1.email);
                    expect(event.when).to.equal(event1.when);
                });
            });

            it('Should allow to instantiate a new instance of the data model constructor directly and save.', function() {
                return Event(event1).save().then(function(event) {
                    expect(event.email).to.equal(event1.email);
                    expect(event.when).to.equal(event1.when);
                });
            });
        });

        describe('Retrieval of Data', function() {
            beforeEach(Fixtures.createApplication());

            // Initialize the mocks.
            beforeEach(function() {
                Event = application.model(Fixtures.Mocks.Event);

                // Set the ID attribute.
                Event.set('id.attribute', '$loki');

                // Copy event1 from fixtures to local.
                event1 = _.extend({}, Fixtures.Mocks.event1);

                // Copy event2 from fixtures to local.
                event2 = _.extend({}, Fixtures.Mocks.event2);

                // Generate events from fixtures.
                events = Fixtures.generateEvents();
            });

            // Insert Data
            beforeEach(function() {
                var promises = [];

                promises.push(Event.insert(event1).then(function(event) {
                    // console.log("APPENDING1", event);
                    _.extend(event1, event);
                }));
                promises.push(Event.insert(event2).then(function(event) {
                    // console.log("APPENDING2", event);
                    _.extend(event2, event);
                }));

                // Push the generated events into the DB.
                for(var i = 0; i < events.length; i++) {
                    promises.push(Event.insert(events[i]));
                }

                return Q.all(promises);
            });

            afterEach(Fixtures.stopApplication());

            it('Should allow to retrieve an object by ID from a data model.', function() {
                return Event.retrieve.byId(event1.id()).then(function(event) {
                    expect(event.email).to.equal(event1.email);
                    expect(event.when).to.equal(event1.when);
                });
            });

            it('Should allow to retrieve objects by an attribute value from a data model.', function() {
                return Event.retrieve.byAttr('when', event1.when).then(function(events) {
                    expect(events.length).to.equal(1);

                    expect(events[0].email).to.equal(event1.email);
                    expect(events[0].when).to.equal(event1.when);
                });
            });

            it('Should allow to retrieve objects by an attribute based on a criteria.', function() {
                return Event.retrieve.byAttr('when', '<', Fixtures.getTimestampFromNow(7 * 60 * 60 * 1000),
                                             'when', '>=', Fixtures.getTimestampFromNow(8 * 60 * 60 * 1000)).then(function(events) {
                    expect(events.length).to.equal(100);
                });
            });
        });

        describe('Update of data', function() {
            beforeEach(Fixtures.createApplication());

            // Initialize the mocks.
            beforeEach(function() {
                Event = application.model(Fixtures.Mocks.Event);

                // Set the ID attribute.
                Event.set('id.attribute', '$loki');

                // Copy event1 from fixtures to local.
                event1 = _.extend({}, Fixtures.Mocks.event1);

                // Copy event2 from fixtures to local.
                event2 = _.extend({}, Fixtures.Mocks.event2);
            });

            // Insert Data
            beforeEach(function() {
                var promises = [];

                promises.push(Event.insert(event1).then(function(event) {
                    event1 = event;
                }));
                promises.push(Event.insert(event2).then(function(event) {
                    event2 = event;
                }));

                return Q.all(promises);
            });

            afterEach(Fixtures.stopApplication());

            it('Should allow to update an existing attribute in an object in a data model.', function() {
                var testEmail = 'test99@test.com';

                event1.email = testEmail;

                return event1.update().then(function(event) {
                    expect(event.email).to.equal(testEmail);
                });
            });

            it('Should allow to add an attribute to an object in a data model.', function() {
                var checked = true;

                event2.checked = checked;

                return event2.update().then(function(event) {
                    expect(event2.checked).to.equal(checked);
                });
            });
        });

        describe('Deletion of data', function() {
            beforeEach(Fixtures.createApplication());

            // Initialize the mocks.
            beforeEach(function() {
                Event = application.model(Fixtures.Mocks.Event);

                // Set the ID attribute.
                Event.set('id.attribute', '$loki');

                // Copy event1 from fixtures to local.
                event1 = _.extend({}, Fixtures.Mocks.event1);
            });

            // Insert Data
            beforeEach(function() {
                var promises = [];

                promises.push(Event.insert(event1).then(function(event) {
                    event1 = event;
                }));

                return Q.all(promises);
            });

            afterEach(Fixtures.stopApplication());

            it('Should allow to delete an object in a data model.', function() {
                return event1.delete();
            });
        });
    });
});
