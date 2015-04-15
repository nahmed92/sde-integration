'use strict';

var app = angular.module('standardization.service', ['standardization.config', 'standardization.model', 'service']);

app.factory('standardizationService', function(StandardizationRestangular, BaseService, Standardization) {

  var StandardizationService = BaseService.extend({

    init: function() {
      this._super(Standardization, StandardizationRestangular);
    },

    addVariations: function(parameterId, data) {
      return this.future(this.Restangular.one(this.route, parameterId).customPUT(data, null));
    }

    // The methods for findByParameterId, deleteVariation and deleteAllVariations have been removed because they are not required for this project (sde-integration).
    // Sde-integration only adds new variations, and has no other use cases utilizing standardization service.
  });
  return new StandardizationService();
});
