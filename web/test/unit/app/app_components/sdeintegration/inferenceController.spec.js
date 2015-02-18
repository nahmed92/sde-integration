'use strict';

describe('Controller: InferenceContoller', function() {

  beforeEach(module('inference'));
  beforeEach(module('uiRouterNoop'));

  var $scope;
  var $compile;
  var $rootScope;
  var inferenceService;
  var deferredInferredValues;
  var angularGrowl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$rootScope_, $controller, $q, APP_CONFIG, growl) {
    $rootScope = _$rootScope_
    $scope = $rootScope.$new();
    angularGrowl = growl;

    inferenceService = {
      findInferencedValuesByParameterIdAndValue: function() {}
    };

    deferredInferredValues = $q.defer();
    spyOn(inferenceService, 'findInferencedValuesByParameterIdAndValue').andReturn(deferredInferredValues.promise);
    spyOn(angularGrowl, 'success').andCallThrough();
    spyOn(angularGrowl, 'error').andCallThrough();

    var attrs = {
      engine: 'f01ea16f-0dd5-4aa6-a7ab-6a2bcbafc4a1'
    };
    $controller('InferenceController', {
      $scope: $scope,
      inferenceService: inferenceService,
      $attrs: attrs
    });

    $scope.findElement = function(parameterId) {
      return angular.element('<select id="pp_111_25698_0" parameter-name="Proc Speed"></select>');
    };

    $scope.findUnitGroup = function(parameterId) {
      return angular.element('<select inputid="pp_111_25698_0" parameter-name="Proc Speed"></select>');
    };

  }));

  it('should initialize scope', function() {
    expect($scope.model).toBeDefined();
  });

  xit('should find inferred values for an item(parameterId|parameterValue)', function() {
    var paramId = 2226680;
    var paramValue = 'SP3';

    var inferredValues = {
      'inference': ["2226297|D520", "2230593|40 GB", "21995|1 GB", "22248|Latitude D520 Notebook", "21748|Dell, Inc", "21750|BBY-680569076540-REFURBISHED", "225596|Dell"]
    };
    $scope.findValues(paramId, paramValue);
    deferredInferredValues.resolve(inferredValues);
    $scope.$digest();

    expect($scope.inferredValues.length).toBe(7);
    expect($scope.inferredValues[0].parameterName).toBe('Proc Speed');
    expect($scope.inferredValues[0].inferredValue).toBe('D520');

    expect($scope.inferredValues[6].parameterName).toBe('Proc Speed');
    expect($scope.inferredValues[6].inferredValue).toBe('Dell');
  });

  xit('should accept inferred value and extract it', function() {
    $scope.inferredValues = [{
      'inferredValue': '2.5 GHz',
      'isUnitGroupAttached': false,
      'manuallyExtractedValue': '1.83 MHz',
      'parameterId': '2229779',
      'parameterName': 'Processor Speed'
    }, {
      'inferredValue': 'Yes',
      'isUnitGroupAttached': false,
      'manuallyExtractedValue': '',
      'parameterId': '225698',
      'parameterName': 'Hyper-Threading'
    }];

    var infer = {
      'inferredValue': '2.5 GHz',
      'isUnitGroupAttached': false,
      'manuallyExtractedValue': '1.83 MHz',
      'parameterId': '2229779',
      'parameterName': 'Processor Speed'
    };

    $scope.acceptInference(infer, true);

    expect($scope.inferredValues.length).toBe(1);
    expect(angularGrowl.success).toHaveBeenCalledWith('Inferred Value Extracted');
  });

  xit('should reject the inferred value', function() {
    $scope.inferredValues = [{
      'inferredValue': '2.5 GHz',
      'isUnitGroupAttached': false,
      'manuallyExtractedValue': '1.83 MHz',
      'parameterId': '2229779',
      'parameterName': 'Processor Speed'
    }, {
      'inferredValue': 'Yes',
      'isUnitGroupAttached': false,
      'manuallyExtractedValue': '',
      'parameterId': '225698',
      'parameterName': 'Hyper-Threading'
    }];

    var infer = $scope.inferredValues[0];

    $scope.rejectInference(infer, true);

    expect($scope.inferredValues.length).toBe(1);
    expect($scope.inferredValues[0].parameterName).toBe('Hyper-Threading');
    expect($scope.inferredValues[0].inferredValue).toBe('Yes');
    expect(angularGrowl.error).toHaveBeenCalledWith('Inference Rejected');
  });
});
