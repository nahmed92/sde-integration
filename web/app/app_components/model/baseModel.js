'use strict';

var app = angular.module('model', ['Class']);

app.factory('BaseModel', function($q, Class) {

  var BaseModel = Class.extend({
    init: function(data) {
      if (data) {
        this.setData(data);
      }
    },
    setData: function(data) {
      angular.extend(this, data);
    },
    isNew: function() {
      return !(this._links && this._links.self);
    }
  });

  return BaseModel;
});
