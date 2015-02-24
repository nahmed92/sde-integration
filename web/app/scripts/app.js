'use strict';

angular.module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'fx.animations', 'angular-growl', 'app.config', 'app.config.restangular', 'inference']).config(function(growlProvider, $urlRouterProvider, RestangularProvider, $sceProvider) {
  growlProvider.globalDisableCountDown(true);
  growlProvider.globalTimeToLive(4000);

  $urlRouterProvider.otherwise('/infer');

  $sceProvider.enabled(false);
});
