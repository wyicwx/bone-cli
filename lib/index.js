'use strict';
var path = require('path'),
	resolve = require('resolve'),
	fs = require('fs');

exports.setupCLI = function(bonefile) {
	var base = path.dirname(bonefile);
	try {
		// try to find bone module at cwd.
		var bone = resolve.sync('bone', {basedir: base});
	} catch(e) {
		console.log('Fatal error: Unable to find local bone module.');
		process.exit(0);
	}
	// load bone core.
	bone = require(bone);

	if(bone.version < '0.0.22') {
		// warning when bone version lower than 0.0.22.
		console.log('Fatal error: require bone 0.0.22 version or more.');
		process.exit(0);
	}

	// load cli.js, it return commander instance.
	var commander = require('./cli.js').setup(bone, base);
	// load configure file.
	require(bonefile);
	// setup cwd as bone fs base.
	bone.setup(path.dirname(bonefile));
	
	if(process.env.BONE_TASK) {// process.env has flag then run in child process.
		require('./task.js').runCP();
	} else if(!process.argv.slice(2).length) { // arguments are empty, output helpe.
		commander.outputHelp();
	} else { // parse process.argv
		commander.parse(process.argv);
	}

	return bone;
};