'use strict';

angular.module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'fx.animations', 'angular-growl', 'app.config', 'app.config.restangular', 'inference']).config(function(growlProvider, $urlRouterProvider, RestangularProvider) {
  growlProvider.globalDisableCountDown(true);
  growlProvider.globalTimeToLive(4000);

  RestangularProvider.setRequestInterceptor(function(elem, operation) {

    if (operation === 'put') {
      elem._id = undefined;
      return elem;
    }
    return elem;
  });

  RestangularProvider.setRestangularFields({
    selfLink: '_links.self.href'
  });

  RestangularProvider.setResponseExtractor(function(response, operation) {
    // adds HAL support
    var newResponse = [];
    if (operation === 'getList') {
      newResponse = response._embedded ? response._embedded[Object.keys(response._embedded)[0]] : [];
      newResponse.page = response.page;
      newResponse.links = response._links;
    } else {
      // This is an element
      newResponse = response;
    }
    return newResponse;
  });

  $urlRouterProvider.otherwise('/infer');
});
