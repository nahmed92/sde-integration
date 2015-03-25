'use strict';

var app = angular.module('cmsCodedValue.service', ['cmsCodedValue.model', 'service', 'taxonomy.commons', 'app.config']);

app.factory('cmsCodedValueService', function(BaseService, CmsCodedValue, TaxonomyRestangular, APP_CONFIG) {

  var CmsCodedValueService = BaseService.extend({
    init: function() {
      this._super(CmsCodedValue, TaxonomyRestangular);
    },

    findCodedValuesByCategoryIdAndParameterId: function(data) {
      return this.future(this.Restangular.allUrl(this.route, APP_CONFIG.taxonomyUrl + '/cmsCodedValues/search/findByCategoryIdAndParameterId').getList(data));
    },

    findOneByCategoryIdParameterIdAndValue: function(data) {
      return this.future(this.Restangular.allUrl(this.route, APP_CONFIG.taxonomyUrl + '/cmsCodedValues/search/findOneByCategoryIdParameterIdAndValue').getList(data));
    }

  });

  return new CmsCodedValueService();
});
