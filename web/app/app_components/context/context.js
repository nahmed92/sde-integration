'use strict';
var app = angular.module('context.holder', []);
app.factory('context', function($rootScope) {
  var context = {
    _current: null,
    getCurrent: function() {
      return this._current;
    },
    setCurrent: function(current) {
      this._current = current;
      $rootScope.$broadcast(this.EVENT_UPDATE, current);
    },
    clear: function() {
      this._current = null;
      $rootScope.$broadcast(this.EVENT_CLEAR);
    },
    EVENT_UPDATE: 'contextupdated',
    EVENT_CLEAR: 'contextcleared'

  };
  return context;
});
