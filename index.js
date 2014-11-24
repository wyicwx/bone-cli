'use strict';
var path = require('path'),
	resolve = require('resolve'),
	Command = require('commander').Command;

exports.setupBone = function(base) {
	try {
		var bone = resolve.sync('bone', {basedir: base});
		bone = require(bone);
	} catch(e) {
		console.log('Fatal error: Unable to find local bone.');
		process.exit(0);
	}
	var commander = exports.commander = new Command('bone');
	bone.cli = function(module, option) {
		option || (option = {});

		var command = function(name) {
			return commander.command(option.alias || name);
		};

		module(command, bone);
	};
	
	commander.version(bone.version);
	var build = require('bone-build');
	bone.cli(build());

	return bone;
};