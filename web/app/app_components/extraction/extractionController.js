'use strict';

var app = angular.module('extraction', ['extraction.service', 'extraction.routes', 'extractedValue.model', 'taxonomy', 'cmsCodedValue.service', 'cmsUnit.service', 'standardization.service', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize', 'dialogs.main', 'dialogs.default-translations']);

app.controller('ExtractionController', function($scope, extractionService, ExtractedValue, cmsCodedValueService, cmsUnitService, standardizationService, _, $window, $location, $log, dialogs) {

  $scope.showMessage = false;
  $scope.processed = false;

  function init() {
    $scope.model = {
      inferredValues: [],
      acceptedCount: 0,
      inferredCount: 0,
      rejectedCount: 0,
      alreadyExtracted: 0,
      skipped: 0,
      productId: $location.search().productId,
      attributeId: $location.search().attributeId
    };

    var obj = $window.parent.getObjectByAttributeId($scope.model.attributeId);
    $scope.model.categoryId = obj.categoryId;
    angular.extend($scope.model, obj);

    extractionService.extractForSourceValue(getObjectForPost(obj)).then(function(extractedValues) {
      _.each(extractedValues.extraction, function(extraction) {
        var paramId = extraction.parameterId;
        var obj = $scope.findElement(paramId);
        if (obj) {
          var inferred = new ExtractedValue(angular.extend(obj, extraction));
          if (!inferred.isSameAsExtracted()) {
            inferred.headerId = $window.parent.parameterHeaderMap[paramId];
            $scope.model.inferredValues.push(inferred);
            $scope.model.inferredCount++;
          } else {
            $scope.model.alreadyExtracted++;
            $log.info('Skipping extraction as it is same as extracted value', paramId);
          }
          // For all extracted coded values and units, we check if they are standardized (taxonomy service)
          if (inferred.isCoded || inferred.hasUnit) {
            $scope.checkNonStandard(inferred);
          }
        } else {
          $scope.model.skipped++;
          $log.info('Skipping extraction as parameter does not exist on page', paramId);
        }
      });

      $scope.headers = $window.parent.headerSortOrder;
      // Group by headers
      $scope.model.inferredValues = _.groupBy($scope.model.inferredValues, 'headerId');
      // Sort by header order
      $scope.model.inferredValues = $scope.sort($scope.model.inferredValues);

      $scope.showMessage = _.keys($scope.model.inferredValues).length === 0;
      $scope.processed = true;
    }, function() {
      $scope.showMessage = true;
      $scope.processed = true;
    });
  }

  $scope.findElement = function(parameterId) {
    return $window.parent.getInputObjectByParameterId(parameterId);
  };

  $scope.acceptInference = function(infer) {
    // This object unsavedParam is a global object of editSpecs which keeps track of the unsaved parameter.
    // So whenever we change a parameter, we have to add the element to this object.
    if (infer.isRepeatable) {
      $window.parent.unsavedParam.addRepeatableInferredParameter(infer.element, infer);
    } else {
      $window.parent.unsavedParam.addInferredParameter(infer.element, infer);
    }
    $scope.model.inferredValues[infer.headerId] = _.without($scope.model.inferredValues[infer.headerId], infer);
    if ($scope.model.inferredValues[infer.headerId].length === 0) {
      delete $scope.model.inferredValues[infer.headerId];
    }
    $scope.model.acceptedCount++;
    $scope.closeIfNeeded();
  };

  $scope.rejectInference = function(infer) {
    $scope.model.inferredValues[infer.headerId] = _.without($scope.model.inferredValues[infer.headerId], infer);
    if ($scope.model.inferredValues[infer.headerId].length === 0) {
      delete $scope.model.inferredValues[infer.headerId];
    }
    $scope.model.rejectedCount++;
    $scope.closeIfNeeded();
  };

  $scope.rejectAllInferredValues = function() {
    var dlg = dialogs.confirm('Reject All', 'Are you sure you want to reject all the values?', {
      size: 'sm'
    });
    dlg.result.then(function() {
      $log.info('Rejecting all values');
      angular.forEach(_.keys($scope.model.inferredValues), function(headerId) {
        $scope.rejectAllInferredValuesInList($scope.model.inferredValues[headerId]);
      });
    });
  };

  $scope.rejectAllInferredValuesInList = function(list, confirm) {
    if (confirm === true) {
      var dlg = dialogs.confirm('Reject All In Header', 'Are you sure you want to reject all the values for this header?', {
        size: 'sm'
      });
      dlg.result.then(function() {
        $log.info('Rejecting all values in header');
        angular.forEach(list, function(inference) {
          $scope.rejectInference(inference);
        });
      });
    } else {
      angular.forEach(list, function(inference) {
        $scope.rejectInference(inference);
      });
    }
  };

  $scope.acceptAllInferredValues = function() {
    angular.forEach(_.keys($scope.model.inferredValues), function(headerId) {
      $scope.acceptAllInferredValuesInList($scope.model.inferredValues[headerId]);
    });
  };

  $scope.acceptAllInferredValuesInList = function(list) {
    angular.forEach(list, function(inference) {
      $scope.acceptInference(inference, false);
    });
  };

  $scope.isEmpty = function(str) {
    return str === undefined || str === null || str.trim() === '';
  };

  $scope.sort = function(inferredValues) {
    var headerIds = _.pluck($scope.headers, 'headerId');
    var keys = _.sortBy(_.keys(inferredValues), function(key) {
      return headerIds.indexOf(key);
    });
    var result = {};
    _.each(keys, function(key) {
      result[key] = _.sortBy(inferredValues[key], function(obj) {
        return $window.parent.parameterSortOrder.indexOf(obj.parameterId);
      });
    });
    return result;
  };

  $scope.headerName = function(headerId) {
    return _.find($scope.headers, {
      headerId: headerId
    }).headerName;
  };

  $scope.getKeys = function(obj) {
    return _.keys(obj);
  };

  $scope.closeIfNeeded = function() {
    if (_.keys($scope.model.inferredValues).length === 0) {
      $window.parent.closeExtractionPopover();
    }
  };

  /**
   * Extraction specific methods
   */

  $scope.showStandardization = function(infer) {
    if (infer.showStandardization) {
      infer.showStandardization = false;
    } else {
      infer.showStandardization = true;
      infer.loadingStandardValues = true;
      var obj = {
        categoryId: $scope.model.categoryId,
        parameterId: infer.parameterId,
        value: infer.hasUnit ? infer.targetUnit : infer.value
      };
      if (infer.hasUnit) {
        cmsUnitService.findUnitValuesByCategoryIdAndParameterId(obj).then(function(data) {
          infer.units = data;
          infer.loadingStandardValues = false;
        });
      } else {
        cmsCodedValueService.findCodedValuesByCategoryIdAndParameterId(obj).then(function(data) {
          infer.codedValues = data;
          infer.loadingStandardValues = false;
        });
      }
    }
  };

  $scope.addStandardization = function(inference) {
    if (inference.standardValue) {
      var data = {};
      if (inference.hasUnit) {
        data[inference.targetUnit] = inference.standardValue;
        inference.targetUnit = inference.standardValue;
      } else {
        data[inference.targetValue] = inference.standardValue;
        inference.targetValue = inference.standardValue;
      }
      standardizationService.addVariations(inference.parameterId, data);

      $scope.acceptInference(inference);
    }
  };

  function getParameterIdsForHeader(headerId) {
    var parameterIds = [];
    var parameterHeaderMap = $window.parent.parameterHeaderMap;
    // This parameterHeaderMap is created in inference.js in edit specs, and contains a map of parameterId to headerId
    _.each(_.keys(parameterHeaderMap), function(parameterId) {
      if (headerId === parameterHeaderMap[parameterId]) {
        parameterIds.push(parameterId);
      }
    });
    return parameterIds;
  }

  function getObjectForPost(obj) {
    var result = {
      productId: obj.productId,
      text: obj.text,
      categoryId: obj.categoryId,
      parameterIds: getParameterIdsForHeader(obj.headerId)
    };
    return result;
  }

  $scope.checkNonStandard = function(infer) {
    infer.checkingNonStandard = true;
    var obj = {
      categoryId: $scope.model.categoryId,
      parameterId: infer.parameterId,
      value: infer.hasUnit ? infer.targetUnit : infer.value
    };

    // We are setting the applicable service in a local variable, so that we have to write the callback only once
    var service = infer.hasUnit ? cmsUnitService : cmsCodedValueService;
    service.findOneByCategoryIdParameterIdAndValue(obj).then(function(data) {
      if (data[0] && data[0].active === true) {
        infer.isNonStandard = false;
        // Using the coded value / unit name from standardization service, to ensure standard capitalization
        // Standardization service does case insensitive comparison, but returns the response with correct case
        if (infer.hasUnit) {
          infer.updateUnit(data[0].name);
        } else {
          infer.updateValue(data[0].value);
        }
      } else {
        infer.isNonStandard = true;
      }
      infer.checkingNonStandard = false;
    }, function() {
      $log.warn('Could not check standarization for Parameter Id ' + obj.parameterId + ' with value ' + obj.value);
      infer.checkingNonStandard = false;
    });
  };

  init();

});
