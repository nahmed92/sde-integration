'use strict';

var app = angular.module('standardization.config', ['restangular', 'app.config']);

app.factory('StandardizationRestangular', function(Restangular, APP_CONFIG) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl(APP_CONFIG.standardizationUrl);
  });
});
