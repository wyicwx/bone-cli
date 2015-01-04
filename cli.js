var Command = require('commander').Command;
var spawn = require('child_process').spawn;

exports.setup = function(bone) {
	var commander = new Command('bone');

	

	var commandList = {};

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
	bone.cli.task = function(name) {
		var cmds = Array.prototype.slice.call(arguments, 1);
		var cmdParse = [];

		cmds.forEach(function(option) {
			if(option.name) {
				var input = [option.name];
				for(var i in option.params) {
					input.push((i.length > 1 ? '--' : '-') + i);
					if(option.params[i]) {
						input.push(option.params[i]);
					}
				}
				cmdParse.push(input);
			}
		});

		bone.cli(function(command) {
			command(name)
			.description('custom task')
			.action(function() {
				var index = 0;
				function next() {
					var parse = cmdParse[index];
					if(parse) {
						var child = spawn('bone', parse);

						child.stdout.on('data', function(data) {
							console.log(data.toString());
						});
						child.stderr.on('data', function(data) {
							console.log(data.toString());
						})
						child.on('exit', function(code) {
							if(code == 0) {
								next();
							} else {
								console.log('Failed :'+parse[0]);
							}
						});
					}
					index++;
				}
				next();
			});
		});
	};

	bone.cli.log = function() {

	};

	bone.cli.error = function() {
		console.log('')
	};

	bone.cli.warnning = function() {

	};

	commander.version(bone.version);
	var build = require('bone-build');
	bone.cli(build());

	return commander;
}

