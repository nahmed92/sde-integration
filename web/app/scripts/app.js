'use strict';

angular.module('app', ['ui.bootstrap', 'ngAnimate', 'fx.animations', 'angular-growl', 'app.config', 'app.config.restangular', 'inference']).config(['growlProvider', function(growlProvider) {
  growlProvider.globalDisableCountDown(true);
  growlProvider.globalTimeToLive(4000);
}]);
