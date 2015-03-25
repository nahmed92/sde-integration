'use strict';

var app = angular.module('standardization.model', ['model']);

app.factory('Standardization', function(BaseModel) {

  var Standardization = BaseModel.extend({
    init: function(data) {
      this._super(data);
    }
  });

  Standardization.route = 'standards';

  return Standardization;
});
