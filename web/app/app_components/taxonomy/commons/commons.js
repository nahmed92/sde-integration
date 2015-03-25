'use strict';

var app = angular.module('taxonomy.commons', ['restangular', 'app.config']);

app.factory('TaxonomyRestangular', function(Restangular, APP_CONFIG) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl(APP_CONFIG.taxonomyUrl);
  });
});
