'use strict';

var app = angular.module('inference', ['inference.service', 'inferredValue.model', 'inference.routes', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize', 'dialogs.main', 'dialogs.default-translations']);

app.controller('InferenceController', function($scope, inferenceService, _, $window, $location, $log, InferredValue, dialogs) {

  $scope.inferredValues = [];
  $scope.parameterName = '';
  $scope.parameterValue = '';
  $scope.showMessage = false;
  $scope.processed = false;

  function init() {
    $scope.model = {
      acceptedCount: 0,
      inferredCount: 0,
      rejectedCount: 0,
      alreadyExtracted: 0,
      skipped: 0,
      engineId: $location.search().engineId
    };
    var item = decodeURIComponent($location.search().item);
    var value = item.split('|');

    var obj = new InferredValue(angular.extend($window.parent.getInputObjectByParameterId(value[0]), {
      inferredValue: ' | '
    }));
    $scope.parameterName = obj.parameterName;
    $scope.parameterValue = obj.extractedDisplayValue;

    $scope.findValues(value[0], value[1]);
  }

  $scope.findValues = function(attrId, attrValue) {
    $scope.inferredValues = [];
    var data = {
      item: attrId + '|' + attrValue
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
            $scope.inferredValues.push(inferred);
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

      // sort by parameter order
      $scope.inferredValues = $scope.sort($scope.inferredValues);

      $scope.showMessage = $scope.inferredValues.length === 0;
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
    // So whenever we change a parameter, we have to add the element to this object. Please not using element[0] to set the DOM object
    // instead of element which is jquery object
    if (infer.isRepeatable) {
      $window.parent.unsavedParam.addRepeatableInferredParameter(infer.element, infer);
    } else {
      $window.parent.unsavedParam.addInferredParameter(infer.element, infer);
    }
    $scope.inferredValues = _.without($scope.inferredValues, infer);
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
    $scope.inferredValues = _.without($scope.inferredValues, infer);
    $scope.model.rejectedCount++;
    $scope.closeIfNeeded();
  };

  $scope.acceptAllInferredValues = function() {
    angular.forEach($scope.inferredValues, function(inference) {
      $scope.acceptInference(inference, false);
    });
  };

  $scope.rejectAllInferredValues = function() {
    var dlg = dialogs.confirm('Reject All', 'Are you sure you want to reject all the inferred values?', {
      size: 'sm'
    });
    dlg.result.then(function() {
      $log.info('Rejecting all values');
      angular.forEach($scope.inferredValues, function(inference) {
        $scope.rejectInference(inference);
      });
    });
  };

  $scope.closeIfNeeded = function() {
    if ($scope.inferredValues.length === 0) {
      $window.parent.closePopover();
    }
  };

  $scope.isEmpty = function(str) {
    return str === undefined || str === null || str.trim() === '';
  };

  $scope.sort = function(values) {
    return _.sortBy(values, function(val) {
      return $window.parent.parameterSortOrder.indexOf(val.parameterId);
    });
  };

  init();

});
