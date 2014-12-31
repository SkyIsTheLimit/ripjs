// Resolve the dependencies here.
var _ = require('underscore');
var fs = require('fs');

// Built in HTTP module.
var http = require('http');
var express = require('express');

// Load some colors.
var colors = require('colors/safe');

// Require the DB module.
var db = require('./db/db.js');

// Helps in pluralizing model names.
var pluralize = require('pluralize');

// Set the terminal theme.
colors.setTheme({
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'cyan',
	success: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

(function(_, fs, http, express, db, colors) {
	// RIP JS Configuration object.
	var conf = {};

	// This is another config object.
	var config = {};

	// Express app.
	var app;
	// HTTP Server.
	var server;

	// Status of RIPJS
	var status = 0;
	var statuses = ["Not Started", "Initialized", "Running", "Stopped"];

	var setConfig = function(c) {
		if(typeof c !== 'undefined') {
			_.extend(config, c);

			return this;
		}
		else
			return config;
	};

	var start = function(configFile, callback) {
		if(status === statuses[2]) {
			console.log(colors.warn("RIP has already been started."));
			return false;
		}

		if(typeof configFile !== 'undefined' && configFile.constructor === Function) {
			callback = configFile;
			configFile = undefined;
		}

		if(config.logging)
			console.log(colors.info("Starting RIP Server. . ."));

		// Check if conf file exists from user.
		configFile = configFile || config.conf;

		loadConfig(configFile || "./rip.conf.json", function(conf, error) {
			if(typeof error !== 'undefined') {
				status = statuses[3];

				if(typeof callback !== 'undefined' && callback.constructor === Function)
					callback(conf, error);

				return;
			}

			startServer(conf, function(app) {
				status = statuses[2];

				if(typeof callback !== 'undefined' && callback.constructor === Function)
					callback(conf);
			});
		});

		return true;
	};

	var loadProcessConfig = function() {
		var defaultConfig = {
			logging: true,
			conf: "./rip.conf.json",
			port: 9999
		};

		var c = {};

		_.extend(c, defaultConfig);
		_.extend(c, config);

		config = c;
	};

	var loadConfig = function(configFile, callback) {
		configFile = configFile || config.conf;

		if(config.logging)
			console.log(colors.info("Loading config file: " + configFile));

		var defaultConfig = {
			// Nothing as of now.
			name: "RIPJS"
		};

		// Initialize with default config.
		_.extend(conf, defaultConfig);

		// First load the conf data.
		if(fs.existsSync(configFile)) {
			fs.readFile(configFile, "utf8", function(err, data) {
				var userConf = JSON.parse(data);

				// Override the configuration object with the user config.
				_.extend(conf, userConf);

				// Process the models from the conf.
				processModels(conf);

				if(typeof callback !== 'undefined' && callback.constructor === Function)
					callback(conf);
			});
		} else {
			console.log("File not found");
			callback(conf, {
				message: "File not found!"
			});
		}
	};

	var startServer = function(conf, callback) {
		var cookieParser = require('cookie-parser');
		var bodyParser = require('body-parser');
		var cookieSession = require('cookie-session');

		app = express();
		app.set('port', process.env.RIPJS_PORT || config.port);

		app.use(cookieParser());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(bodyParser.json());
		app.use(cookieSession({ secret: '1' }));
		app.use(function(request, response, next){
			console.log(colors.success(request.method + " " + request.url));
			next();
		});

		_.each(conf.models, function(model) {
			addModelToServer(app, model, function(routes) {
				// console.log("Added routes", routes);
			});
		});

		// Good time to process the relationships.
		processRelationships(conf);

		// Handle 404
		app.use(function(request, response) {
			console.log(colors.error(request.method + " " + request.url + "\n"));
			response.send('404: Page not Found', 404);
		});

		// Handle 500
		app.use(function(error, request, response, next) {
			console.log(colors.error(request.method + " " + request.url), error);
			response.send('500: Internal Server Error', 500, error);
		});

		server = http.createServer(app).listen(app.get('port'), function() {
			if(config.logging)
				console.log(colors.success("\nServer started on port " + app.get('port') + "\n"));

			// Sync DB
			db.sync();

			if(typeof callback !== 'undefined' && callback.constructor === Function)
				callback(app);
		});

		server.on('error', function(error) {
			console.log(colors.error("Something went wrong: " + error.message));
		});
	};

	var addModelToServer = function(app, model, callback) {
		conf.routes = conf.routes || [];
		var routes = [];

		// Is model visible.
		model.visible = model.visible || true;

		if(model.visible) {
			var all_route = '/' + pluralize(model.name);

			app.get(all_route, function(request, response) {
				var Model = db.models()[model.name];

				db.get(model.name).then(function(data) {
					response.send(data);
				});
			});
			routes.push('GET ' + all_route);

			var create_route = '/' + pluralize(model.name);

			app.post(create_route, function(request, response) {
				var Model = db.models()[model.name];

				Model.create(request.body).then(function(created) {
					response.send(created);
				});
			});
			routes.push('POST ' + create_route);

			var retrieve_route = '/' + pluralize(model.name) + '/:id';

			app.get(retrieve_route, function(request, response) {
				var Model = db.models()[model.name];

				db.get(model.name).then(function(data) {
					response.send(data);
				});

			});
			routes.push('GET ' + retrieve_route);

			var update_route = '/' + pluralize(model.name) + '/:id';

			app.put(update_route, function(request, response) {
				response.send("PUT " + update_route);
			});
			routes.push('PUT ' + update_route);

			var delete_route = '/' + pluralize(model.name) + '/:id';

			app.delete(delete_route, function(request, response) {
				response.send("DELETE " + delete_route);
			});
			routes.push('DELETE ' + delete_route);

			// Add the routes to the conf object.
			conf.routes = conf.routes.concat(routes);

			if(config.logging) {
				console.log("");

				_.each(routes, function(route) {
					var tab;
					if(route.indexOf("GET") !== -1 || route.indexOf("PUT") !== -1)
						tab = "\t\t";
					else
						tab = "\t";

					console.log(colors.success("[GENERATED] " + route.replace(" ", tab)));
				});
			}
		}
		
		// Finally add the model to the DB.
		db.addModel(model);

		if(typeof callback !== 'undefined' && callback.constructor === Function)
			callback(routes);

		return true;
	};

	var containsId = function(model) {
		for(var i = 0; i < model.fields.length; i++)
			if(model.fields[i].name === "id")
				return true;
		
		return false;
	};

	var processModels = function(conf) {
		_.each(conf.models, function(model) {
			if(!containsId(model)) {
				model.fields.push({
					"name": "id",
					"type": "number",
					"extra": [ "auto-increment", "primary-key" ]
				});
			}
		});
	};

	// Only do many to one. Map it as a one to one on the many side.
	var processRelationships = function(conf) {
		_.each(conf.models, function(model) {
			processModelRelationships(model);
		});
	};

	var processModelRelationships = function(model) {
		for(var relative in model.relatedTo) {
			var as = model.relatedTo[relative]["as"];
			var type = model.relatedTo[relative]["type"];

			if(type === 'many-to-one') {
				var source = getModel(model.name);
				var destination = getModel(relative);

				destination.belongsToMany(source, { "as": as });
			}
		}
	};

	var getModel = function(name) {
		return db.models()[name];
	};

	var ui = function() {
		if(config.logging)
			console.log(colors.success("Opening up the RIP UI. . ."));

		return true;
	};

	var _RIP = function() {
		this.start = start;
		this.ui = ui;
		this.config = setConfig;
		this.conf = function() {
			return conf;
		};
		this.app = function() {
			return app;
		};
		this.status = function() {
			return status;
		};
		this.db = function() {
			return db;
		};
		this.model = function(name) {
			return getModel(name) || {};
		};

		status = statuses[1];
	};

	var RIP = new _RIP();

	var config = {
		version: "0.0.0",
		name: "REST In Peace"
	};

	_.extend(RIP, config);

	// Load the process config.
	loadProcessConfig();

	if(typeof module !== 'undefined' && module.exports)
		module.exports = RIP;
})(_, fs, http, express, db, colors);