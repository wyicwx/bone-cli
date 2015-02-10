var Command = require('commander').Command;
var spawn = require('child_process').spawn;
var os = require('os');
var task = require('./task');

exports.setup = function(bone) {
	var commander = new Command('bone');
	var commanders = commander.commanders = {};

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

	task.setup(bone, commander, commanders);
	commander.version(bone.version);
	var build = require('bone-build');
	bone.cli(build());

	return commander;
};
