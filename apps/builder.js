var bone = require('bone');

var builder = bone.commander.command('build');

var notHelp = false;
builder.description('build file/project')
	.option('-p, --project <project>', 'build project', function() {
		console.log('p');
		process.exit(0);
	})
	.option('-l, --list', 'list project contents', function() {
		console.log('list');
		process.exit(0);
	})
	.action(function() {
		if(arguments.length > 1) {

		} else {
			builder.help();
		}
	});