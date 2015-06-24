/**
 * Model Factory Creator
 *
 * The Model Factory Creator is responsible for creating Model factories based
 * on the configuration passed in.
 * The configuration would mainly indicate the DB details.
 *
 * @author Sandeep Prasad <s3g007@gmail.com>
 *
 */

var _ = require('underscore');
var Q = require('q');
var Loki = require('lokijs');

var utils = require('./utils');
var logger = require('./logger');

var extractData = utils.extractData;

// The current instance.
var instance = {
    // Configuration for the current instance.
    configuration: {},

    // The DB object for the current instance.
    db: {}
};

/**
 * The Model Factory Creator Constructor function. Instantiate your MFC here.
 */
var ModelFactoryCreator = function(configuration) {
    var deferred = Q.defer();

    // Copy the configuration.
    _.extend(instance.configuration, configuration);

    // Instantiate the DB.
    instance.db = new Loki(configuration.db.name || 'rip.db');

    // Function to load an existing database.
    var loadDatabase = function() {
        var deferred = Q.defer();

        instance.db.loadDatabase({}, function(err) {
            if(err) {
                logger.warn('No existing DB found', configuration.db.name);
            } else {
                logger.info('Existing DB Found. Connected to', configuration.db.name);
            }

            deferred.resolve();
        });

        return deferred.promise;
    };

    // Function to save the database.
    var saveDatabase = function() {
        var deferred = Q.defer();

        instance.db.saveDatabase(function(err) {
            if(err) {
                logger.error('Could not save database', err);

                return deferred.reject(err);
            }

            logger.info('Created DB', configuration.db.name);

            return deferred.resolve();
        });

        return deferred.promise;
    };

    // The models within the application.
    var models = {};

    /**
     * Overloaded method. The actual factory which creates models. If a string is
     * passed in, it returns the model with that name, else instantiates a new model
     * with the details passed in.
     */
    var Factory = function(options) {
        if(typeof options === 'string') {
            return models[options];
        }

        // Create a collection on the DB too if it isn't already created.
        var collection = instance.db.getCollection(options.name);

        // Check if collection doesn't exist.
        if(!collection) {
            // Add the colletion.
            instance.db.addCollection(options.name);
        }

        // Return the newly created model. Wrap it in the Model class.
        return (models[options.name] = Model(options));
    };

    // Ok, now let's compose the return.
    var chain = Q.fcall(function() {
        return true;
    });

    // Auto load enabled?
    if(configuration.db.load === true)      chain.then(loadDatabase);

    // Auto save enabled?
    if(configuration.db.create === true)    chain.then(saveDatabase);

    // Finally, return the Factory.
    chain.then(function() {
        return deferred.resolve(_.extend(Factory, instance));
    });

    return deferred.promise;
};

/**
 * The Model class. This is the ORM interface for the RIP engine. The RIP engine
 * will only be able to use the interface of this class. It is therefore the responsability
 * of this class to cover up the additional details and return an effective interface.
 */
var Model = function(options) {
    // Properties.
    var properties = {};

    // The collection for this model.
    var collection = instance.db.getCollection(options.name);

    var staticMethods = {
        properties: properties,

        /**
         * Function for setting some global properties on this model instance.
         */
        set: function(key, value) {
            properties[key] = value;
        },

        /**
         * Function to return all the objects in the collection.
         */
        all: function() {
            var deferred = Q.defer();

            var results = collection.find();

            if(!results) {
                deferred.reject('No results found in ', options.name);
            } else {
                deferred.resolve(results);
            }

            return deferred.promise;
        },

        /**
         * Function used to create a new instance of this model. This function only
         * creates the instance and does not save it. Use the save function to save
         * it too.
         */
        create: function() {
            return utils.pure(Constructor.apply(null, arguments));
        },

        /**
         * Function used to create a new instance of this model. This function also
         * saves ths instance in the DB.
         */
        insert: function() {
            return Constructor.apply(null, arguments).save();
        },

        /**
         * Function used to create a new instance of this model. This function also
         * saves ths instance in the DB.
         */
        save: function() {
            return Constructor.apply(null, arguments).save();
        },

        // The retrieval functions.
        retrieve: {
            /**
             * Function to retrieve by ID. The ID attribute and it's semantics can
             * vary greatly for diffrent DBs. It is for this reason that there is an
             * id() method on every model instance that can be used to retrieve the ID
             * in a Database agnostic way.
             */
            byId: function(id) {
                var deferred = Q.defer();

                var result = collection.get(id);

                if(!result) {
                    deferred.reject('No ' + options.name + ' found for ID ' + id);
                } else {
                    deferred.resolve(_.extend(Constructor.apply(null, []), result));
                }

                return deferred.promise;
            },

            /**
             * One of the cooler retrieval functions. This function creats a condition
             * to execute against the database based on the type and number of inputs
             * passed to the function.
             *
             * If 2 arguments are passed, then it is considered to be an equality operation
             * between the 2 arguments passed.
             * If more than 2 arguments are passed, then sets of 3 arguments are used in a
             * (key, operator, value) tuple to be processed as a condition.
             */
            byAttr: function(attr, value) {
                var deferred = Q.defer();

                // The criteria to be sent to the DB.
                var criteria;

                // Map of operators.
                var map = {
                    '=': '$eq',
                    '>': '$gt',
                    '>=': '$gte',
                    '<': '$lt',
                    '<=': '$lte',
                    '!=': '$ne',
                    'contains': '$contains',
                    'in': '$in'
                };

                // Function to create a condition.
                var condition = function(key, operator, value) {
                    var condition = {};
                    condition[key] = {};
                    condition[key][map[operator]] = value;

                    return condition;
                };

                // Processes the set of 3 attribute queries.
                var process = function(key, operator, value) {
                    if(typeof criteria === 'undefined') {
                        // Then this is the first condition.
                        criteria = condition(key, operator, value);
                    } else {
                        // Check if there is already an and.
                        if(typeof criteria['$and'] !== 'undefined') {
                            // Just add another condition.
                            _.extend(criteria['$and'], condition(key, operator, value));
                        } else {
                            // Compose the and condition.
                            // Pull out the existing condition. There should only be one right now.
                            var existingKey = Object.keys(criteria)[0];

                            var existingValue = criteria[existingKey];
                            var existingCondition = {};
                            existingCondition[existingKey] = existingValue;

                            criteria = { '$and': [] };

                            criteria['$and'].push(existingCondition);
                            criteria['$and'].push(condition(key, operator, value));
                        }
                    }
                };

                // This is defaulting to equality operator.
                if(arguments.length === 2) {
                    process(attr, '=', value);
                } else {
                    // Function to pull out the 3-tuples.
                    var slice = (function(n) {
                        return function slice(parameters, queries) {
                            if(parameters.length === 0) {
                                return queries;
                            }

                            queries.push(parameters.splice(0, n));

                            slice(parameters, queries);
                        };
                    }(3));

                    // Push all the 3-tuples in this array.
                    var queries = [];

                    // Slice it up.
                    slice(Array.prototype.slice.call(arguments), queries);

                    // Pass the queries through the process function.
                    for(var i = 0; i < queries.length; i++) {
                        process.apply(null, queries[i]);
                    }
                }

                // Run the criteria against the database.
                var result = collection.find(criteria);

                // Attach the Model class's instance methods on to the object.
                result = result.map(function(instance) {
                    return _.extend(Constructor.apply(null, []), instance);
                });

                if(!result) {
                    deferred.reject('No ' + options.name + ' found with the given criteria.');
                } else {
                    deferred.resolve(result);
                }

                return deferred.promise;
            }
        }
    };

    var instanceMethods = {
        /**
         * The id method used for retrieving the ID of the object in a database
         * agnostic way.
         */
        id: function() {
            return this[properties['id.attribute'] || 'id'];
        },

        /**
         * The save method writes the current object to the DB.
         */
        save: function() {
            var deferred = Q.defer();

            var result = collection.insert(extractData(this));

            deferred.resolve(_.extend(this, result));

            return deferred.promise;
        },

        /**
         * The update method updates the current object to the DB.
         */
        update: function() {
            var deferred = Q.defer();

            collection.update(extractData(this));

            var result = collection.get(this.id());

            deferred.resolve(_.extend(this, result));

            return deferred.promise;
        },

        /**
         * The delete method deletes the current object from the DB.
         */
        delete: function() {
            var deferred = Q.defer();

            try {
                collection.remove(extractData(this));

                deferred.resolve(true);
            } catch(e) {
                deferred.reject(e);
            }

            return deferred.promise;
        }
    };

    /**
     * While the Model constructor allows you to create a class for a Model dynamically,
     * this constructor is used for instantiating object from that class. That is why,
     * this constructor is returned from the closure of the Model Constructor.
     */
    var Constructor = function(initial) {
        // Create an instance. This will be used to bind to the methods within it.
        var result = _.extend({}, initial, instanceMethods);

        // Function used for setting the right this on the context of the static functions.
        var processBindings = function(value) {
            for(var key in value) {
                if(typeof value[key] === 'function') {
                    // Do the bindings.
                    value[key] = value[key].bind(result);
                } else if(typeof value[key] === 'object') {
                    processBindings(value[key]);
                }
            }
        };

        // Bind the this.
        processBindings(result);

        // Return the instance.
        return result;
    };

    // Return the dynamically created constructor.
    return _.extend(Constructor, staticMethods);
};

// Export the MFC.
module.exports = ModelFactoryCreator;
