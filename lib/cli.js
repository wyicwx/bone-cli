var Command = require('commander').Command;
var spawn = require('child_process').spawn;
var os = require('os');
var task = require('./task');
var resolve = require('resolve');
var fs = require('fs');
var path = require('path');

function parseArgv() {
	if(!process.env.BONE_TASK) {
		var parsed = {};
		var argv;

		if(process.argv) {
			argv = process.argv.slice(2);
		}

		if(!argv[0] || argv[0].indexOf('-') !== -1) {
			return parsed;
		}

		parsed.command = argv.shift();
		parsed.options = {_: []};

		var prevOption;

		argv.forEach(function(option) {
			if(option.indexOf('-') === 0) {
				prevOption = option.replace(/^--?/, '');
				parsed.options[prevOption] = '';
			} else {
				if(prevOption) {
					parsed.options[prevOption] = option;
					prevOption = null;
				} else {
					parsed.options._.push(option);
				}
			}
		});
	} else {
		parsed = JSON.parse(process.env.BONE_TASK_MASTER_ARGV);
		parsed.isTask = true;
	}

	return parsed;
}

exports.setup = function(bone, base) {
	var commander = new Command('bone');
	var commanders = commander.commanders = {};

	// version
	commander.version(bone.version);

	commander.on('*', function(args) {
		if(!task.run(args[0])) {
			commander.outputHelp();
		}
	});


	bone.cli = function(module, option) {
		option || (option = {});
		var cmder;
		var command = function(name) {
			var cname = option.alias || name;

			commanders[cname] = {events: []};
			var subccommander = commanders[cname]['commander'] = commander.command(cname);
			subccommander.command = null;
			subccommander.cname = cname;

			if(option.always) {
				commanders[cname].events.push(option.always);
			}

			commander.on(cname, function() {
				commanders[cname].events.forEach(function(fn) {
					fn.call(null);
				});
			});
			cmder = subccommander;
			return subccommander;
		};

		module(command, bone);

		return cmder;
	};


	var pkg = path.join(base, 'package.json');

	if(pkg && fs.existsSync(pkg)) {
		try {
			bone.cli.pkg = require(pkg);
		} catch(e) {
			bone.cli.pkg = {};
		}
	} else {
		bone.cli.pkg = {};
	}

	bone.cli.savePkg = function(p) {
		if(p) {
			_.extend(bone.cli.pkg, p);
		}

		fs.writeFile(pkg, JSON.stringify(bone.cli.pkg, null, 2), function(err) {
			if(err) throw err;
		});
	};

	// parse argv
	bone.cli.argv = parseArgv();


	// task support
	task.setup(bone, commander, commanders);
	// build commander support
	bone.cli(require('bone-build')());

	return commander;
};
