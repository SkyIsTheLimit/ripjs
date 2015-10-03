/**
 * RIPJS
 * REST In Peace
 * Helps you in creating REST endpoints quickly.
 *
 * @author Sandeep Prasad <s3g007@gmail.com>
 *
 */
var _ = require('underscore');
var Q = require('q');

var ModelFactoryCreator = require('./mfc');
var utils = require('./utils');
var Configuration = require('./configuration');
var logger = require('./logger');

var pure = utils.pure;

// The RIP Engine.
var RIP = {
    /**
     * Function to create an application. Processes the configuration to create
     * the models and endpoints and then returns an instance of the application.
     *
     * This function can be used to create multiple RIP applications.
     */
    create: function(configuration) {
        var deferred = Q.defer();

        // Initialize the configuration.
        configuration = configuration || {};

        // Store the configuration.
        Configuration(configuration.name, configuration);

        var application = {
            name: configuration.name,
            status: "initialized",
            configuration: configuration,
            models: [],
            endpoints: []
        };

        ModelFactoryCreator(configuration).then(function(Factory) {
            application.model = function(options) {
                return Factory.call(null, options);
            };

            _.each(configuration.models, function(model) {
                application.models.push(Factory(model));
            });

            return Factory.createEndpoints();
        }).then(function() {
            deferred.resolve(application);
        }).catch(function() {
            deferred.reject.apply(deferred, arguments);
        });

        return deferred.promise;
    },

    /**
     * Running the RIP application essentially means to start up the server with
     * the endpoints hosted. The endpoints are generated from the configuration
     * supplied to the create function.
     */
    run: function(app) {
        app.status = "started";

        logger.info('Started application ', app.name);

        return pure(app);
    },

    /**
     * The stop function pulls down the server which is hosting the endpoints.
     */
    stop: function(app) {
        app.status = "stopped";

        return pure(app);
    }
};

// Attach the logger to the main object.
RIP.Logger = logger;

// Export the RIP Engine.
module.exports = RIP;
