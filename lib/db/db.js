var _ = require('underscore');

var Sequelize = require('sequelize');
var colors = require('colors/safe');

var sequelize = new Sequelize('ripjs', 'postgres', 'root123', {
	host: 'localhost',
	dialect: 'postgres',
	logging: function(log) {
		// console.log(colors.warn("[SEQUELIZE] ") + colors.data(log) + "\n");
	}
});

// var User = sequelize.define('User', {
// 	username: Sequelize.STRING,
// 	birthday: Sequelize.DATE
// });

// sequelize.sync().success(function() {
// 	User.create({
// 		username: 'sandeep3180',
// 		birthday: new Date(1990, 08, 07)
// 	}).success(function(user) {
// 		console.log("Created User", user);
// 		console.log("Details", user.values);
// 	});
// })



var DB = function() {
	var models = {};

	var getSequelizeType = function(type) {
		if(type === 'date')
			return Sequelize.DATE;
		else if(type === 'number')
			return Sequelize.INTEGER;
		return Sequelize.STRING;
	};

	this.addModel = function(model) {
		var name = model.name;
		var fields = {};

		_.each(model.fields, function(field) {
			if(typeof field.extra !== 'undefined') {
				fields[field.name] = {};
				fields[field.name]["type"] = getSequelizeType(field.type);

				if(field.extra.indexOf("primary-key") !== -1) {
					fields[field.name]["primaryKey"] = true;
				}
				if(field.extra.indexOf("auto-increment") !== -1) {
					fields[field.name]["autoIncrement"] = true;
				}
			} else
				fields[field.name] = getSequelizeType(field.type)
		});

		// console.log("Created fields for Sequelize", fields);

		var Model = sequelize.define(name, fields);

		models[name] = Model;
	};

	this.models = function() {
		return models;
	};

	this.sync = function() {
		sequelize.sync();
		// console.log("Synced DB Successfully");
	};

	this.get = function(name) {
		return models[name].findAll();
	};

	this.query = sequelize.query.bind(sequelize);
};

module.exports = new DB();


// var pg = require('pg');

// var connectionString = "postgres://postgres:root123@localhost/ripjs";

// var client = new pg.Client(connectionString);

// client.connect(function(err) {
// 	if(err) {
// 		return console.error("Could not connect to postgres.", err);
// 	}

// 	client.query("CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY, name VARCHAR(255), email VARCHAR(64) )", function(err, result) {
// 		if(err) {
// 			return console.error("Error Running Query", err);
// 		}

// 		console.log("Result", result);

// 		client.end();
// 	});
// });