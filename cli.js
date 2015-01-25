var Command = require('commander').Command;
var spawn = require('child_process').spawn;

exports.setup = function(bone) {
	var commander = new Command('bone');
	var commandList = {};
	var tasks = {};

	commander.on('*', function(args) {
		var task = args[0];
		if(task in tasks) {
			tasks[task]();
		} else {
			commander.outputHelp();
		}
	});
	bone.cli = function(module, option) {
		option || (option = {});

		var command = function(name) {
			cname = option.alias || name;

			var subccommander = commander.command(cname);
			subccommander.command = null;

			commandList[cname] = subccommander;
			return subccommander;
		};

		module(command, bone);
	};

	/**
		usage:
			bone.cli.task('release', {
					command: 'build',
					params: {
						project: 'dist'
					}
				},
				{
					command: 'connect'
			});
	 */
	bone.task = bone.cli.task = function(name) {
		var cmds = Array.prototype.slice.call(arguments, 1);
		var cmdParse = [];

		cmds.forEach(function(option) {
			if(typeof option === 'string') {
				option = {
					name: option
				};
			} else if(typeof option === 'function') {
				return cmdParse.push(option);
			}
			if(option.name) {
				var input = [option.name];
				for(var i in option.params) {
					input.push((i.length > 1 ? '--' : '-') + i);
					if(option.params[i]) {
						input.push(option.params[i]);
					}
				}
				var run = function(next) {
					var child = spawn('bone', input, {stdio: [0]});
					child.stdout.setEncoding = 'utf-8';
					child.stderr.setEncoding = 'utf-8';
					child.stdout.pipe(process.stdout, { end:true });
					child.stderr.pipe(process.stderr, { end:true });
					child.on('exit', function(code) {
						if(code == 0) {
							next();
						} else {
							console.log('Failed :'+parse[0]);
						}
					});
				}
				cmdParse.push(run);
			}
		});

		tasks[name] = function() {
			var index = -1;
			function next() {
				index++;
				var runFn = cmdParse[index];
				if(runFn) {
					if(runFn.length) {
						runFn(next);
					} else {
						runFn();
						next();
					}
				}
			}
			next();
		};

		var usage = ['[options] [command]\r\n\r\n  Task:'];
		for(var i in tasks) {
			usage.push(i);
		}
		commander.usage(usage.join(' '));
	};

	bone.cli.log = function() {

	};

	bone.cli.error = function() {

	};

	bone.cli.warnning = function() {

	};

	commander.version(bone.version);
	var build = require('bone-build');
	bone.cli(build());

	return commander;
}

