'use strict';
var path = require('path'),
	resolve = require('resolve'),
	fs = require('fs');

exports.setupBone = function(base) {
	var bone = resolve.sync('bone', {basedir: base});
	if(bone && fs.existsSync(bone)) {
		bone = require(bone);
	} else {
		console.log('Fatal error: Unable to find local bone.');
		process.exit(0);
	}

	exports.commander = require('./cli.js').setup(bone, base);
	
	return bone;
};