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
      return $q.when(exceptionCodes);
    },

    findByExceptionCodeId: function(id) {
      var deffered = $q.defer();
      this.findActiveExceptionCodes().then(function(exceptionCodes) {
        deffered.resolve(_.find(exceptionCodes, function(exceptionCode) {
          return exceptionCode.id == id; // jshint ignore:line
        }));
      });
      return deffered.promise;
    }
  });

  return new InferenceService();

});
