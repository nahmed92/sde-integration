'use strict';

var app = angular.module('cmsStandardValue.service', ['cmsCodedValue.service', 'cmsUnit.service', 'underscore']);

/**
 * This is a wrapper service class which uses cmsCodedValueService and cmsUnitService to return CMS coded and unit values from a single class
 */
app.factory('cmsStandardValueService', function(cmsCodedValueService, cmsUnitService, $q, _) {

  var cmsStandardValueService = {
    findStandardValuesByCategoryIdParameterIdAndDataType: function(categoryId, parameterId, dataType) {
      var deferredStandardValues = $q.defer();
      var params = {
        categoryId: categoryId,
        parameterId: parameterId
      };
      if (dataType === 'CODED') {
        cmsCodedValueService.findCodedValuesByCategoryIdAndParameterId(params).then(function(codedValues) {
          deferredStandardValues.resolve(codedValues);
        }, function(error) {
          deferredStandardValues.reject(error);
        });
      } else if (dataType === 'UNIT' || dataType === 'FLOAT' || dataType === 'NUMBER') {
        cmsUnitService.findUnitValuesByCategoryIdAndParameterId(params).then(function(unitValues) {
          var standardValues = _.map(unitValues, function(unitValue) {
            return _.extend(unitValue, {
              value: unitValue.name
            });
          });
          deferredStandardValues.resolve(standardValues);
        }, function(error) {
          deferredStandardValues.reject(error);
        });
      } else {
        deferredStandardValues.resolve([]);
      }
      return deferredStandardValues.promise;
    }
  };
  return cmsStandardValueService;
});
