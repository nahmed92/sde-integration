'use strict';

var app = angular.module('inference.service', ['restangular', 'service', 'inference.model', 'underscore', 'app.config']);

app.factory('inferenceService', function(Restangular, BaseService, Inference, APP_CONFIG, $q, _) {

  var InferenceService = BaseService.extend({
    init: function() {
      this._super(Inference, Restangular);
    },

    findInferencedValuesByParameterIdAndValue: function(data, engineId) {
      return this.future(this.Restangular.allUrl(this.route, APP_CONFIG.inferenceUrl + '/engines/' + engineId).customGET('infer', data));
    },

    findActiveExceptionCodes: function() {
      var exceptionCodes = [{
        'id': '1',
        'name': 'InComplete'
      }, {
        'id': '2',
        'name': 'Completed'
      }, {
        'id': '3',
        'name': 'Data N/A'
      }, {
        'id': '4',
        'name': 'Not Applicable'
      }, {
        'id': '5',
        'name': 'Conflict'
      }, {
        'id': '8',
        'name': 'No'
      }, {
        'id': '10',
        'name': 'Status Void'
      }, {
        'id': '11',
        'name': 'Yes'
      }];
      return exceptionCodes;
    },

    findByExceptionCodeId: function(id) {
      return _.find(this.findActiveExceptionCodes(), function(exceptionCode) {
        return parseInt(exceptionCode.id) === parseInt(id);
      });
    }
  });

  return new InferenceService();

});
