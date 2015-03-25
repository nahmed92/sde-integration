'use strict';

var app = angular.module('parameter.service', ['taxonomy.commons', 'parameter.model', 'service']);

app.factory('parameterService', function(TaxonomyRestangular, BaseService, Parameter) {

  var ParameterService = BaseService.extend({
    init: function() {
      this._super(Parameter, TaxonomyRestangular);
    }
  });

  return new ParameterService();

});
