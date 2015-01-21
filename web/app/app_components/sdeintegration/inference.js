'use strict';

var app = angular.module('inference.model', ['model']);

app.factory('Inference', function(BaseModel) {

  var Inference = BaseModel.extend({
    init: function(data) {
      this._super(data);
    }
  });

  Inference.route = 'inference';

  return Inference;

});
