module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			sass: {
				files: ['assets/sass/**/*.{scss,sass}','assets/sass/_partials/**/*.{scss,sass}'],
				tasks: ['sass:dist']
			},
			livereload: {
				files: ['*.html', '*.php', 'assets/js/**/*.{js,json}', 'assets/css/*.css','assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
				options: {
					livereload: true
				}
			}
		},
		sass: {
			dist: {
				options: {
					sourcemap: 'auto',
					style: 'expanded'
				},
				files: {
					'assets/css/style.css': 'assets/sass/style.scss'
				}
			}
		},
		autoprefixer: {
			prod: {
				src: 'assets/css/style.css',
				dest: 'assets/css/style.css'
			}
		}
	});
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['sass:dist', 'watch', 'autoprefixer']);
	//grunt.registerTask('dist', ['sass', 'autoprefixer']);
};