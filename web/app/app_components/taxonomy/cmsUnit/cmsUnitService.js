'use strict';

var app = angular.module('cmsUnit.service', ['cmsUnit.model', 'service', 'taxonomy.commons', 'app.config']);

app.factory('cmsUnitService', function(BaseService, CmsUnit, TaxonomyRestangular, APP_CONFIG) {

  var CmsUnitService = BaseService.extend({
    init: function() {
      this._super(CmsUnit, TaxonomyRestangular);
    },

    findUnitValuesByCategoryIdAndParameterId: function(data) {
      return this.future(this.Restangular.allUrl(this.route, APP_CONFIG.taxonomyUrl + '/cmsUnits/search/findByCategoryIdAndParameterId').getList(data));
    },

    findOneByCategoryIdParameterIdAndValue: function(data) {
      return this.future(this.Restangular.allUrl(this.route, APP_CONFIG.taxonomyUrl + '/cmsUnits/search/findOneByCategoryIdParameterIdAndValue').getList(data));
    }

  });

  return new CmsUnitService();
});
