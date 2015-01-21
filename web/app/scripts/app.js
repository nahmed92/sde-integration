'use strict';
angular.module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'fx.animations', 'footer', 'app.config', 'app.config.restangular', 'inference']).config(function($urlRouterProvider) {

  // For any unmatched url, send to /
  $urlRouterProvider.otherwise('/editspecs');

}).run(function($rootScope, $state, $stateParams) {

  // will be removed when ui-router 3.0 is released
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
});
