var _ = require('underscore');
var express = require('express');
var pluralize = require('pluralize');

var logger = require('./logger');

var app = express();

var createEndpoint = function(model, modelName) {
    var name = modelName.toLowerCase();

    logger.info('GET\t/' + pluralize(name));
    app.get('/' + pluralize(name), function(req, res) {
        model.all().then(function(values) {
            res.send(values);
        }).catch(function(error) {
            res.status(400);
            res.send(error);
        });
    });
};

var Endpoints = {
    create: function(models, options) {
        for(var model in models) {
            createEndpoint(models[model], model);
        }

        var server = app.listen(3000, function() {
            var host = server.address().address;
            var port = server.address().port;

            logger.info('Example app listening at http://', host, ':', port);
        });
    }
};

module.exports = Endpoints;
