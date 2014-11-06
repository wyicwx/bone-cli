'use strict';
var path = require('path'),
	resolve = require('resolve'),
	Command = require('commander').Command;

function setupBone(base) {
	var bone = resolve.sync('bone', {basedir: base});
	bone = require(bone);
	bone.commander = new Command('bone');
	bone.commander.version(bone.version);

//	require('./apps/builder.js')(bone);
	return bone;
}

exports.setupBone = setupBone;
