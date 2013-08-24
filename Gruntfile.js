module.exports = function( grunt ) {
  
  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),
    jshint: {
        files: ['js/*.js'],
        options: {
            force: true,
            jshintrc: "./.jshintrc"
        }
    }

  });

  grunt.loadNpmTasks( 'grunt-contrib-jshint' );

  grunt.registerTask( 'default', [ 'jshint' ] );

};