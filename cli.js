var Command = require('commander').Command;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

exports.setup = function(bone) {
	var commander = new Command('bone');
	var commandList = {};
	var tasks = {};
	var commanders = {};

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
			var cname = option.alias || name;

			commanders[cname] = {events: []};
			var subccommander = commanders[cname]['commander'] = commander.command(cname);
			subccommander.command = null;

			commandList[cname] = subccommander;

			if(option.always) {
				commanders[cname].events.push(option.always);
			}

			commander.on(cname, function() {
				commanders[cname].events.forEach(function(fn) {
					fn.call(null);
				});
			});
			return subccommander;
		};

		module(command, bone);
	};

	
	/**
		usage:
			bone.cli.task('release', {
				name: 'build',
				params: {
					project: 'dist'
				}
			},
			{
				name: 'connect'
			},
			{
				exec: 'node main.js'
			});
	 */
	bone.task = bone.cli.task = function(name) {
		var cmds = Array.prototype.slice.call(arguments, 1);
		var runQueue = [];
		var run = function(cmd, args) {
			return function(next) {
				var child = spawn(cmd, args, {
					stdio: [0, 1, 2], 
					env: bone.utils.extend({BONE_TASK: true}, process.env)
				});
				child.on('exit', function(code) {
					if(code == 0) {
						next();
					} else {
						console.log('Failed : '+cmd+' '+args);
					}
				});
			}
		}
		cmds.forEach(function(option) {
			if(typeof option === 'function') {
				return runQueue.push(option);
			}
			if(typeof option === 'string') {
				if(option in tasks || option in commanders) {
					option = {name: option};
				} else {
					option = {exec: option};
				}
			}
			if(option.exec) {
				var args = option.exec.split(' ').splice(1);
				var cmd = option.exec.split(' ')[0];
				runQueue.push(run(cmd, args));
			} else if(option.name) {
				if(option.name in tasks || option.name in commanders) {
					var args = [option.name];
					for(var i in option.params) {
						args.push((i.length > 1 ? '--' : '-') + i);
						if(option.params[i]) {
							args.push(option.params[i]);
						}
					}
					if(option.always) {
						commanders[option.name].events.push(function() {
							if(process.env.BONE_TASK) {
								option.always.call(null);
							}
						});
					}
					runQueue.push(run('bone', args));
				}
			}
		});

		if(!runQueue.length) {
			return;
		}

		tasks[name] = function() {
			var index = -1;
			function next() {
				index++;
				var runFn = runQueue[index];
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

