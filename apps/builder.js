function setup(bone) {
	var builder = bone.commander.command('build');
	var _ = require('underscore');
	var fs = require('fs');
	var path = require('path');

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
			var files = _.toArray(arguments).slice(0, -1);

			if(files.length) {
				_.each(files, function(file) {
					file = path.resolve(file);
					
					var readStream = bone.createReadStream(file);

					var writeStream = fs.createWriteStream(file);

					readStream.pipe(writeStream);
				});
			} else {
				// warn
			}
		});
}

module.exports = setup;