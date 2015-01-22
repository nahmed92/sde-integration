'use strict';

var app = angular.module('inference.service', ['restangular', 'service', 'inference.model']);

app.factory('inferenceService', function(Restangular, BaseService, Inference) {

  var InferenceService = BaseService.extend({
    init: function() {
      this._super(Inference, Restangular);
    }
  });

  return new InferenceService();

});
