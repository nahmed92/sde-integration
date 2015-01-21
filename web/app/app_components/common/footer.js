'use strict';

var app = angular.module('footer', ['app.config']);

app.controller('FooterCtrl', function($scope, VERSION_CONFIG) {

  $scope.version = VERSION_CONFIG.local.branch.current.name + ' : ' + VERSION_CONFIG.local.branch.current.shortSHA;

});
