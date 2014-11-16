'use strict';
var path = require('path'),
	resolve = require('resolve'),
	Command = require('commander').Command;

function setupBone(base) {
	try {
		var bone = resolve.sync('bone', {basedir: base});
		bone = require(bone);
	} catch(e) {
		console.log('Fatal error: Unable to find local bone.');
		process.exit(0);
	}
	bone.commander = new Command('bone');
	bone.commander.version(bone.version);

	require('bone-build')(bone);
	return bone;
}

exports.setupBone = setupBone;
