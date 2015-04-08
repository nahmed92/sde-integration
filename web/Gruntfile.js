'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // pre-process prod file
  grunt.file.write('.tmp/deploy.json', grunt.template.process(grunt.file.read('deploy.json')));

  // e2e coverage reports
  var reportDir = 'coverage/e2e/' + new Date();

  // Define the configuration for all the tasks
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',
      instrument: 'instrument',
      e2edata: grunt.option('e2edata') || process.env.TMPDIR + '<%=pkg.name%>',
      config: grunt.file.readJSON('.tmp/deploy.json')
    },

    processhtml: {
      options: {
        data: {
          baseHref: '<%= yeoman.config.baseHref %>'
        }
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.app %>/index.html']
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js', '<%= yeoman.app %>/app_components/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/unit/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['scsslint', 'compass:server']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/**/*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test/unit',
            '<%= yeoman.app %>'
          ]
        }
      },
      e2e: {
        options: {
          base: ['.tmp', '<%= yeoman.instrument %>']
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        ignores: ['<%= yeoman.app %>/scripts/config.js']
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        '<%= yeoman.app %>/app_components/**/*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc',
          ignores: ['test/unit/blob.js']
        },
        src: ['test/unit{,*/}*.js']
      }
    },

    scsslint: {
      allFiles: [
        '<%= yeoman.app %>/styles/main.scss'
      ],
      options: {
        bundleExec: false,
        config: '.scss-lint.yml',
        reporterOutput: null,
        colorizeOutput: true
      },
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.app %>/scripts/config.js',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      coverage: 'coverage',
      instrument: '<%= yeoman.instrument %>',
      instrumentjs: '<%= yeoman.instrument %>/<%= yeoman.app %>',
      server: '.tmp'
    },

    // Automatically inject Bower components into the app
    'bower-install': {
      app: {
        html: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/',
        exclude: ['bower_components/bootstrap/', 'bower_components/angular-macgyver/lib/macgyver.min.js']
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/app_components/**/*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,app_components/**/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: false,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html', 'app_components/{,**/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'app_components/**/*.html',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'fonts/*',
            'styles/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      instrumentapp: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>',
        dest: '<%= yeoman.instrument %>',
        src: '**'
      },
      instrumentjs: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.instrument %>/<%= yeoman.app %>',
        dest: '<%= yeoman.instrument %>',
        src: '**'
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      e2e: {
        expand: true,
        dest: '<%= yeoman.e2edata %>',
        cwd: 'test/e2e/data/',
        src: '**'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      //continuous integration mode: run tests once in PhantomJS browser.
      continuous: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      }
    },

    jsbeautifier: {
      files: ['Gruntfile.js', 'app/scripts/**/*.js', 'app/app_components/**/*.js', 'test/**/*.js', 'app/**/*.html'],
      options: {
        html: {
          braceStyle: 'collapse',
          indentChar: ' ',
          indentScripts: 'keep',
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u'],
          wrapLineLength: 0
        },
        js: {
          braceStyle: 'collapse',
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: ' ',
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: false,
          keepArrayIndentation: false,
          keepFunctionIndentation: false,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 0
        },
        // this should be enabled when 1.5.5 version of js-beautify is released
        // css: {
        //  fileTypes: [".scss"],
        //  indentSize: 2,
        //  newline_between_rules: true,
        //  end_with_newline: true
        //}
      }
    },

    ngconstant: {
      options: {
        wrap: '\'use strict\';\n\n {%= __ngModule %}',
        name: 'app.config',
        dest: '<%= yeoman.app %>/scripts/config.js',
        constants: {
          APP_CONFIG: grunt.file.readJSON('.tmp/deploy.json'),
          VERSION_CONFIG: '<%= gitinfo %>'
        }
      },
      build: {}
    },

    // merges e2e and unit coverage
    shell: {
      options: {
        stdout: true
      },
      merge: {
        command: './node_modules/lcov-result-merger/bin/lcov-result-merger coverage/**/lcov.info coverage/coverage.lcov'
      },
    },

    // instruments code for e2e
    instrument: {
      files: ['<%= yeoman.app %>/scripts/*.js', '<%= yeoman.app %>/app_components/**/*.js'],
      options: {
        lazy: true,
        basePath: '<%= yeoman.instrument %>'
      }
    },

    // makes e2e coverage report
    makeReport: {
      src: 'coverage/coverage.json',
      options: {
        type: 'lcov',
        dir: reportDir,
        print: 'detail'
      }
    },

    // runs protractor and collects coverage
    'protractor_coverage': {
      options: {
        configFile: 'e2e.conf.js', // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: true, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      e2e: {
        options: {
          configFile: 'e2e.conf.js', // Target-specific config file
          args: {
            params: {
              e2edata: '<%= yeoman.e2edata %>'
            }
          }
        }
      }
    },

    gitinfo: {
      options: {
        cwd: '../'
      }
    },

    sonarRunner: {
      analysis: {
        options: {
          debug: true,
          separator: '\n',
          dryRun: false,
          sonar: {
            host: {
              url: 'http://sonar.etilizepak.com'
            },
            jdbc: {
              url: 'jdbc:mysql://' + (grunt.option('sonar.jdbc.host') || 'git.etilizepak.com') + ':3306/sonar',
              username: 'sonar',
              password: grunt.option('sonar.jdbc.password') || ''
            },
            projectKey: '<%=pkg.groupId%>:<%=pkg.artifactId%>',
            projectName: '<%=pkg.name%>',
            projectVersion: '<%=pkg.version%>',
            sources: ['app'].join(','),
            exclusions: ['app/bower_components/**', 'app/app_components/**/test.js', 'app/scripts/config.js'].join(','),
            language: 'js',
            sourceEncoding: 'UTF-8',
            analysis: {
              mode: grunt.option('sonar.analysis.mode') || 'incremental'
            },
            issuesReport: {
              html: {
                enable: true
              },
              console: {
                enable: true
              }
            },
            tests: ['test/unit', 'test/e2e'].join(','),
            dynamicAnalysis: 'reuseReports',
            javascript: {
              jstestdriver: {
                reportsPath: './',
                coveragefile: 'coverage/coverage.lcov'
              },
              lcov: {
                reportPath: grunt.file.expand('coverage/coverage.lcov')[0]
              }
            }
          }
        }
      }
    }
  });

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'gitinfo',
      'ngconstant',
      'bower-install',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function() {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('beautify',
    'jsbeautifier'
  );

  grunt.registerTask('test', [
    'clean:server',
    'gitinfo',
    'ngconstant',
    'concurrent:test',
    'connect:test',
    'karma:unit'
  ]);

  grunt.registerTask('test-ci', [
    'clean:server',
    'gitinfo',
    'ngconstant',
    'concurrent:test',
    'connect:test',
    'karma:continuous'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'gitinfo',
    'ngconstant',
    'bower-install',
    'useminPrepare',
    'concurrent:dist',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'processhtml:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'beautify',
    'newer:jshint',
    'scsslint',
    'test',
    'build'
  ]);

  grunt.registerTask('ci', [
    'newer:jshint',
    'scsslint',
    'test-ci',
    'shell:merge',
    'build'
  ]);

  grunt.registerTask('e2e', [
    'clean:server',
    'clean:instrument',
    'gitinfo',
    'ngconstant',
    'bower-install',
    'concurrent:server',
    'instrument',
    'copy:instrumentapp',
    'copy:instrumentjs',
    'clean:instrumentjs',
    'connect:e2e',
    'copy:e2e',
    'protractor_coverage',
    'makeReport'
  ]);

};
