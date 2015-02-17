// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: ['app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/json3/lib/json3.js',
            'app/bower_components/lodash/dist/lodash.compat.js',
            'app/bower_components/restangular/dist/restangular.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/ng-Fx/dist/ngFx.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/angular-underscore-module/angular-underscore-module.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-growl-v2/build/angular-growl.js',
            'app/bower_components/read-more/js/directives/readmore.js',
            'app/bower_components/angular-class/angular-class.js',
            'app/bower_components/angular-busy/dist/angular-busy.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
            'app/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/read-more/js/directives/readmore.js',
            'app/bower_components/angular-translate/angular-translate.js',
            'app/bower_components/angular-dialog-service/dist/dialogs.min.js',
            'app/bower_components/angular-dialog-service/dist/dialogs-default-translations.min.js',
            'app/scripts/*.js',
            'app/app_components/**/*.js',
            'test/unit/**/*.js',
            // templates to be loaded for unit test
            'app/app_components/**/*.html'
            ],

    // list of files / patterns to exclude
    exclude: ['app/app_components/**/test.js'],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Safari'],

    //
    preprocessors: {
      '**/app/scripts/**/*.js': 'coverage',
      'app/app_components/**/*.js': 'coverage',
      //location of templates
      'app/app_components/**/*.html': ['ng-html2js']
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: ['dots', 'junit', 'coverage'],

    junitReporter: {
      outputFile: 'test-results.xml'
    },

    // coverage reporter
    coverageReporter: {
      reporters: [{
        type: 'cobertura'
      }, {
        type: 'lcovonly'
      }],
      dir: 'coverage/'
    },

    ngHtml2JsPreprocessor: {
      // strip app from the file path
      stripPrefix: 'app/'
    }
  });

};
