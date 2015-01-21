'use strict';

var mod = angular.module('uiRouterNoop', []);
mod.service('$state', function() {
  return {}
});
mod.service('$urlRouter', function() {
  return {}
});
