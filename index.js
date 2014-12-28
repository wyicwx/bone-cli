'use strict';
var path = require('path'),
	resolve = require('resolve');

exports.setupBone = function(base) {
	try {
		var bone = resolve.sync('bone', {basedir: base});
		bone = require(bone);
	} catch(e) {
		console.log('Fatal error: Unable to find local bone.');
		process.exit(0);
	}

	exports.commander = require('./cli.js').setup(bone);
	
	return bone;
};