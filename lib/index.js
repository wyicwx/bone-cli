'use strict';
var path = require('path'),
	resolve = require('resolve'),
	fs = require('fs');

exports.setupCLI = function(bonefile) {
	var base = path.dirname(bonefile);
	var bone = resolve.sync('bone', {basedir: base});

	if(bone && fs.existsSync(bone)) {
		bone = require(bone);
	} else {
		console.log('Fatal error: Unable to find local bone.');
		process.exit(0);
	}

	var commander = require('./cli.js').setup(bone, base);

	require(bonefile);

	bone.setup(path.dirname(bonefile));

	if(process.env.BONE_TASK) {
		require('./task.js').runCP();
	} else if(!process.argv.slice(2).length) {
		commander.outputHelp();
	} else {
		commander.parse(process.argv);
	}
	
	return bone;
};