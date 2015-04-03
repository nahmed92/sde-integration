'use strict';

var app = angular.module('parameter.model', ['model']);

app.factory('Parameter', function(BaseModel) {

  var Parameter = BaseModel.extend({
    init: function(data) {
      this._super(data);
    }
  });

  Parameter.route = 'cmsParameters';

  return Parameter;
});
