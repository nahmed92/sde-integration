'use strict';

var app = angular.module('extraction.routes', ['ui.router']);

app.config(function($stateProvider) {
  $stateProvider.state('extraction', {
    url: '/extract',
    templateUrl: 'app_components/extraction/extraction.html',
    controller: 'ExtractionController'
  });
});
