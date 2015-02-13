'use strict';

var app = angular.module('inference.model', ['model']);

app.factory('Inference', function(BaseModel) {

  var Inference = BaseModel.extend({
    inference: [],

    init: function(data) {
      this._super(data);

      // Assigning data in inference array as data adds up properties and methods inherited
      // from Restangular which have undefined properties
      this.inference = data;
    }
  });

  Inference.route = 'inference';

  return Inference;

});
