'use strict';

var app = angular.module('inference', ['inference.service', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize']);

app.controller('InferenceController', function($scope, inferenceService, growl, $attrs, _) {

  $scope.inferredValues = [];
  $scope.parameterName = '';

  function init(attrs) {
    $scope.model = {
      data: {
        engine: attrs.engine
      }
    };
  }

  $scope.findValues = function(attrId, attrValue) {
    $scope.inferredValues = [];
    var data = {
      'item': attrId + '|' + attrValue
    };
    inferenceService.findInferencedValuesByParameterIdAndValue(data, $scope.model.data.engine).then(function(inferredValues) {
      _.each(inferredValues.inference, function(inference) {
        var value = inference.split('|');
        var element = $scope.findElement(value[0]);

        var elemId = element.attr('id');
        // Find out if there is any unit drop down associated with this element
        var unitGroup = $scope.findUnitGroup(elemId);
        if (value[1].indexOf('_EX_') !== -1) {
          inferenceService.findByExceptionCodeId(value[1].replace('_EX_', '')).then(function(exceptionCode) {
            $scope.inferredValues.push({
              'parameterId': value[0],
              'parameterName': element.attr('parameter-name'),
              'inferredValue': exceptionCode.name,
              'exceptionCodeId': exceptionCode.id,
              'isUnitGroupAttached': unitGroup.length > 0 ? true : false,
              'manuallyExtractedValue': unitGroup.length > 0 ? element.val() + ' ' + unitGroup.val() : element.val()
            });
          });
        } else {
          $scope.inferredValues.push({
            'parameterId': value[0],
            'parameterName': element.attr('parameter-name'),
            'inferredValue': value[1],
            'isUnitGroupAttached': unitGroup.length > 0 ? true : false,
            'manuallyExtractedValue': unitGroup.length > 0 ? element.val() + ' ' + unitGroup.val() : element.val()
          });
        }
      });
    });
  };

  $scope.findElement = function(parameterId) {
    return angular.element('*[parameter-id="' + parameterId + '"]');
  };

  $scope.findUnitGroup = function(inputId) {
    return angular.element('*[inputid="' + inputId + '"]');
  };

  $scope.acceptInference = function(infer, showGrowl) {
    var element = $scope.findElement(infer.parameterId);
    if (infer.exceptionCodeId !== undefined) {
      element.attr('ecode', infer.exceptionCodeId);
    } else if (infer.isUnitGroupAttached) {
      var elemId = element.attr('id');
      // Find out if there is any unit drop down associated with this element
      var unitGroup = $scope.findUnitGroup(elemId);
      element.val(infer.inferredValue.split(' ')[0]);
      unitGroup.val(infer.inferredValue.split(' ')[1]);
    } else {
      element.val(infer.inferredValue);
    }


    element.attr('InferredValue', infer.inferredValue);

    if (showGrowl) {
      $scope.inferredValues.splice($scope.inferredValues.indexOf(infer), 1);
      growl.success('Inferred Value Extracted');
    }
  };

  $scope.rejectInference = function(infer, showGrowl) {
    var element = $scope.findElement(infer.parameterId);
    element.attr('InferredValue', infer.inferredValue);

    if (showGrowl) {
      $scope.inferredValues.splice($scope.inferredValues.indexOf(infer), 1);
      growl.error('Inference Rejected');
    }
  };

  $scope.acceptAllInferredValues = function() {
    angular.forEach($scope.inferredValues, function(inference) {
      $scope.acceptInference(inference, false);
    });
    $scope.inferredValues = [];
    growl.success('Inference(s) Accepted');
  };

  $scope.rejectAllInferredValues = function() {
    angular.forEach($scope.inferredValues, function(inference) {
      $scope.rejectInference(inference);
    });

    $scope.inferredValues = [];
    growl.error('Inference(s) Rejected');
  };

  init($attrs);

});
