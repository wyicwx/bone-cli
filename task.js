var bone;
var commander;
var os = require('os');
var spawn = require('child_process').spawn;
var debug = function() {};

function _cp(cmd, option, callback) {
	var args = option.args || [];
	var env = option.env || {};

	debug('start run spawn.'.green);
	debug('cmd:', cmd);
	debug('args:', args);

	if(cmd === 'bone') {
		args = [];
	}
	if(os.platform() == 'win32') {
		args = ['/c', cmd].concat(args);
		cmd = 'cmd';
	}

	spawn(cmd, args, {
		stdio: [0, 1, 2], 
		env: bone.utils.extend(env, process.env),
		encoding: 'utf8'
	}).on('exit', function(code) {
		if(code == 0) {
			callback(null);
		} else {
			console.log('Fatal error: '+cmd+' '+args);
		}
	});
}
/**
 * {
 * 	exec: 'grunt debug'
 * }
 * {
 * 	name: 'build',
 * 	params: {
 * 		_: 'file'
 * 		p: 'release'
 * 	}
 * }
 */
function _parse(work) {
	var tasks = Task.tasks;
	var commanders = commander.commanders;
	var parsedWork = {
		inBone: true
	};
	if(typeof work === 'function') {
		parsedWork.beforeRun = work;
	} else if(typeof work === 'string') {
		parsedWork.args = work.split(' ');
		parsedWork.exec = parsedWork.args.shift();
	} else {
		work = bone.utils.pick(work, ['name', 'exec', 'params', 'always', 'cli', 'beforeRun']);
		bone.utils.extend(parsedWork, work);
		if(!parsedWork.exec && parsedWork.name) {
			parsedWork.exec = parsedWork.name;
		} else if(!parsedWork.name && parsedWork.cli) {
			parsedWork.exec = bone.cli(parsedWork.cli, {alias: 'BONE_TASK_CLI_'+bone.utils.uniqueId()}).cname;
		}
	}

	if(parsedWork.exec) {
		if(parsedWork.exec in tasks || parsedWork.exec in commanders) {
			var options = [];
			var command = [];
			bone.utils.each(parsedWork.params, function(value, order) {
				if(order === '_') {
					if(!Array.isArray(value)) {
						command.push(value);
					} else {
						command = command.concat(value);
					}
				} else {
					options.push((order.length > 1 ? '--' : '-') + order);
					if(value) {
						options.push(value);
					}
				}
			});
			parsedWork.args = [parsedWork.exec].concat(options).concat(command);
		} else {
			parsedWork.inBone = false;
			parsedWork.cmd = parsedWork.exec.split(' ')[0];
			parsedWork.args = parsedWork.exec.split(' ').splice(1);
		}
	}

	if(parsedWork.always) {
		parsedWork.beforeRun = parsedWork.always;
	}

	return parsedWork;
};
function Task(name, raw) {
	this.name = name;
	this.raw = raw;
	this.at = 0;
	this.isMaster = process.env.BONE_TASK ? false : true;
}

Task.prototype.runAt = function(index) {
	var work = this.raw[index];
	var self = this;

	if(!work) {
		return;
	}

	work = _parse(work);

	if(this.isMaster) {
		_cp(work.inBone ? 'bone' : work.cmd, {
			args: work.args,
			env: {
				BONE_TASK: this.name,
				BONE_TASK_INDEX: index,
				BONE_TASK_MASTER_ARGV: JSON.stringify(bone.cli.argv)
			}
		}, function() {
			self.runNext();
		});
	} else {
		debug('run in child process.');
		if(work.beforeRun) {
			work.beforeRun();
		}
		if(work.exec) {
			commander.parse(['node', 'bone'].concat(work.args));
		}
	}
};

Task.prototype.runNext = function() {
	this.runAt(this.at++);
};

Task.prototype.run = function() {
	this.runNext();
};

Task.tasks = {};

exports.setup = function(b, cmder) {
	bone = b;
	commander = cmder;
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
		if(typeof name !== 'string') {
			throw new Error('Fatal error: Task name must be set.');
		}
		if(name in Task.tasks) {
			throw new Error('Override error: exist task.');
		}
		var list = Array.prototype.slice.call(arguments, 1);

		Task.tasks[name] = new Task(name, list);

		var usage = ['[options] [command]\r\n\r\n  Task:'];
		for(var i in Task.tasks) {
			usage.push(i);
		}
		commander.usage(usage.join(' '));
	};
};

exports.run = function(task) {
	if(task in Task.tasks) {
		Task.tasks[task].run();
		return true;
	} else {
		return false;
	}
};

exports.runCP = function() {
	var task = process.env.BONE_TASK;
	var index = process.env.BONE_TASK_INDEX;

	Task.tasks[task].runAt(index);
};