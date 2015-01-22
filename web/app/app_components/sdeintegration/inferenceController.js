'use strict';

var app = angular.module('inference', ['inference.routes', 'inference.service', 'ui.router', 'ui.bootstrap', 'angular-growl', 'app.config', 'sdeutils']);

app.controller('InferenceController', function($scope) {

  function init() {
    $scope.model = {};
  }

  init();

});
