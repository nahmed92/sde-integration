'use strict';
/*globals unsavedParam, getInputObjectByParameterId */

var app = angular.module('inference', ['inference.service', 'inferredValue.model', 'ui.bootstrap', 'readMore', 'app.config', 'sdeutils', 'underscore', 'ngSanitize']);

app.controller('InferenceController', function($scope, inferenceService, growl, $attrs, _, $modal, InferredValue) {

  $scope.inferredValues = [];
  $scope.parameterName = '';

  function init(attrs) {
    $scope.model = {
      data: {
        engineId: attrs.engineId
      }
    };
  }

  $scope.open = function() {
    $scope.modalInstance = $modal.open({
      templateUrl: 'app_components/sdeintegration/inference.html',
      scope: $scope,
      keyboard: false,
      backdrop: 'static'
    });

    $scope.modalInstance.result.then(function(selectedItem) {
      $scope.selected = selectedItem;
    }, function() {});
  };

  $scope.findValues = function(attrId, attrValue) {
    $scope.inferredValues = [];
    var data = {
      'item': attrId + '|' + attrValue
    };


    inferenceService.findInferencedValuesByParameterIdAndValue(data, $scope.model.data.engineId).then(function(inferredValues) {
      _.each(inferredValues.inference, function(inference) {

        var paramId = inference.split('|')[0];
        var obj = $scope.findElement(paramId);
        if (obj) {
          $scope.inferredValues.push(new InferredValue(angular.extend(obj, {
            inferredValue: inference
          })));
        } else {
          console.log('Skipping inference because parameter does not exist on page', paramId);
        }
      });
      if ($scope.inferredValues.length > 0) {
        $scope.open();
      }
    });
  };

  $scope.findElement = function(parameterId) {
    return getInputObjectByParameterId(parameterId);
  };

  $scope.findUnitGroup = function(inputId) {
    return angular.element('*[inputid="' + inputId + '"]');
  };

  $scope.acceptInference = function(infer, showGrowl) {
    // This object unsavedParam is a global object of editSpecs which keeps track of the unsaved parameter.
    // So whenever we change a parameter, we have to add the element to this object. Please not using element[0] to set the DOM object
    // instead of element which is jquery object
    unsavedParam.addInferredParameter(infer.element, infer);

    if (showGrowl) {
      $scope.inferredValues.splice($scope.inferredValues.indexOf(infer), 1);
      growl.success('Inferred Value Extracted');
      if ($scope.inferredValues.length === 0) {
        $scope.modalInstance.close();
      }
    }
  };

  $scope.rejectInference = function(infer, showGrowl) {
    // This object unsavedParam is a global object of editSpecs which keeps track of the unsaved parameter.
    // So whenever we change a parameter, we have to add the element to this object. Please not using element[0] to set the DOM object
    // instead of element which is jquery object
    unsavedParam.rejectInferredParameter(infer.element, infer);

    if (showGrowl) {
      $scope.inferredValues.splice($scope.inferredValues.indexOf(infer), 1);
      growl.error('Inference Rejected');
      if ($scope.inferredValues.length === 0) {
        $scope.modalInstance.close();
      }
    }
  };

  $scope.acceptAllInferredValues = function() {
    angular.forEach($scope.inferredValues, function(inference) {
      $scope.acceptInference(inference, false);
    });
    $scope.inferredValues = [];
    growl.success('Inference(s) Accepted');
    $scope.modalInstance.close();
  };

  $scope.rejectAllInferredValues = function() {
    angular.forEach($scope.inferredValues, function(inference) {
      $scope.rejectInference(inference);
    });

    $scope.inferredValues = [];
    growl.error('Inference(s) Rejected');
    $scope.modalInstance.close();
  };

  init($attrs);

});
