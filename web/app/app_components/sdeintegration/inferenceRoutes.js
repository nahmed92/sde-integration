'use strict';

var app = angular.module('inference.routes', ['ui.router']);

app.config(function($stateProvider) {
  $stateProvider.state('inference', {
    url: '/infer',
    templateUrl: 'app_components/sdeintegration/inference.html',
    controller: 'InferenceController'
  });
});
