'use strict';

var app = angular.module('extraction.service', ['restangular', 'service', 'extraction.model']);

app.factory('extractionService', function(Restangular, BaseService, Extraction) {

  var ExtractionService = BaseService.extend({
    init: function() {
      this._super(Extraction, Restangular);
    },
    extractForSourceValue: function(data) {
      return this.future(this.Restangular.all(this.route).post(data));
    }
  });

  return new ExtractionService();

});
