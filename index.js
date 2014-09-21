'use strict';
var path = require('path'),
	resolve = require('resolve'),
	Command = require('commander').Command;

var bone = require('bone');

var commander = bone.commander = new Command('bone');

commander.version(bone.version);

require('./apps/builder.js');
// commander.option('-p, --peppers', 'Add peppers');

// commander.help();
// require('./')
