'use strict';

angular.module('app.config.restangular', ['restangular', 'app.config']).config(function(RestangularProvider, APP_CONFIG) {

  RestangularProvider.setBaseUrl(APP_CONFIG.baseUrl);
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

});
