'use strict';

var app = angular.module('inference', ['inference.service', 'inferredValue.model', 'inference.routes', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize', 'dialogs.main', 'dialogs.default-translations']);

app.controller('InferenceController', function($scope, inferenceService, _, $window, $location, $log, InferredValue, dialogs) {
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
      engineId: $location.search().engineId,
      analyticsKey: $location.search().analyticsKey
    };

    var item = decodeURIComponent($location.search().item);

    var value = item.split('|');
    var parameterId = value.shift(); // Using first element of array as parameter id
    value = value.join('|'); // Concatenating remaining values using | to cater the possibility of values having |

    $scope.findValues(parameterId, value);
  }

  $scope.findValues = function(attrId, attrValue) {
    $scope.model.inferredValues = [];
    var data = {
      item: attrId + '|' + attrValue,
      analyticsKey: $scope.model.analyticsKey
    };

    inferenceService.findInferencedValuesByParameterIdAndValue(data, $scope.model.engineId).then(function(inferredValues) {
      _.each(inferredValues.inference, function(inference) {
        var paramId = inference.split('|')[0];
        var obj = $scope.findElement(paramId);
        if (obj) {
          var inferred = new InferredValue(angular.extend(obj, {
            inferredValue: inference
          }));
          if (!inferred.isSameAsExtracted()) {
            inferred.headerId = $window.parent.parameterHeaderMap[paramId];
            $scope.model.inferredValues.push(inferred);
            $scope.model.inferredCount++;
          } else {
            $scope.model.alreadyExtracted++;
            $log.info('Skipping inference as it is same as extracted value', paramId);
          }
        } else {
          $scope.model.skipped++;
          $log.info('Skipping inference as parameter does not exist on page', paramId);
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
  };

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
    // This object unsavedParam is a global object of editSpecs which keeps track of the unsaved parameter.
    // So whenever we change a parameter, we have to add the element to this object. Please not using element[0] to set the DOM object
    // instead of element which is jquery object
    if (infer.isRepeatable) {
      $window.parent.unsavedParam.rejectRepeatableInferredParameter(infer.element, infer);
    } else {
      $window.parent.unsavedParam.rejectInferredParameter(infer.element, infer);
    }
    $scope.model.inferredValues[infer.headerId] = _.without($scope.model.inferredValues[infer.headerId], infer);
    if ($scope.model.inferredValues[infer.headerId].length === 0) {
      delete $scope.model.inferredValues[infer.headerId];
    }
    $scope.model.rejectedCount++;
    $scope.closeIfNeeded();
  };

  $scope.rejectAllInferredValues = function() {
    var dlg = dialogs.confirm('Reject All', 'Are you sure you want to reject all the inferred values?', {
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
      var dlg = dialogs.confirm('Reject All In Header', 'Are you sure you want to reject all the inferred values for this header?', {
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
      $scope.acceptInference(inference);
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
      $window.parent.closeInferencePopover();
    }
  };

  init();

});
