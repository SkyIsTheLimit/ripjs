#!/usr/bin/env node
var RIP = require('ripjs');

// Load some colors.
var colors = require('color/safe');

// Invoke any command line args.
var commands = process.argv.slice(2) || [];

if(commands.length === 0)
	commands = [ 'start' ];

if(commands.length !== 0) {
	if(typeof RIP[commands[0]] !== 'undefined')
		RIP[commands[0]].apply(this, process.argv.slice(3));
	else if(config.logging) {
		console.log(colors.red("\n\tInvalid command specified : '" + commands[0] + "'"));
		console.log(colors.red("\tUSAGE : node index.js [start|ui] <conf-file>"))
	}
}