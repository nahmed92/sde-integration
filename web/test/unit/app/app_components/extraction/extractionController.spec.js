'use strict';

describe('Controller: ExtractionContoller', function() {

  beforeEach(module('extraction'));
  beforeEach(module('app.constants'));
  beforeEach(module('uiRouterNoop'));

  var $scope, $compile, $rootScope, $location, $window, extractionService, cmsCodedValueService, cmsUnitService, standardizationService, deferredExtractedValues, angularGrowl, productId, attributeId, mockElementObjects, CONST, dialog, dialogResult, PROCESSORCHIPSET, GENERALINFORMATION, MEMORY;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$rootScope_, $controller, _$location_, $q, APP_CONFIG, growl, _CONST_) {
    $rootScope = _$rootScope_;
    $location = _$location_;
    $scope = $rootScope.$new();
    angularGrowl = growl;
    CONST = _CONST_;

    // Header Ids
    PROCESSORCHIPSET = 72;
    GENERALINFORMATION = 35;
    MEMORY = 52;

    dialogResult = $q.defer();
    dialog = {
      confirm: function() {},
      result: function() {}
    };

    productId = '10000142';
    attributeId = '111';

    extractionService = {
      extractForSourceValue: function() {}
    };
    cmsCodedValueService = {
      findOneByCategoryIdParameterIdAndValue: function() {}
    };
    cmsUnitService = {
      findOneByCategoryIdParameterIdAndValue: function() {}
    };
    standardizationService = {

    };

    // pass state to search controller
    $location.search({
      productId: productId,
      attributeId: attributeId
    });

    /**
     * extraction controller depends on a lot of globals defined in edit specs, which are accessed in the iframe using $window.parent
     * We are mocking those variables and methods here.
     * Any logic changes in edit specs affecting these variables should be accompanied by same changes in these mocks.
     */
    $window = {
      parent: {
        getObjectByAttributeId: function(parameterId) {
          return {
            element: {},
            parameterId: parameterId,
            parameterName: 'Parameter Name',
            hasUnit: false,
            isNumber: false,
            isCoded: false,
            isRepeatable: false,
            extractedValue: '',
            extractedEcode: undefined
          };
        },

        parameterHeaderMap: {
          21751: GENERALINFORMATION,
          2230522: PROCESSORCHIPSET,
          2229779: PROCESSORCHIPSET,
          2239228: PROCESSORCHIPSET,
          22268: PROCESSORCHIPSET,
          2226064: MEMORY
        },
        headerSortOrder: [{
          headerId: GENERALINFORMATION,
          headerName: 'General Information'
        }, {
          headerId: PROCESSORCHIPSET,
          headerName: 'Processor & Chipset'
        }, {
          headerId: MEMORY,
          headerName: 'Memory'
        }],
        parameterSortOrder: [21751, 2230522, 2229779, 2239228, 22268, 2226064],
        unsavedParam: {
          addInferredParameter: function() {},
          addRepeatableInferredParameter: function() {}
        },
        closeExtractionPopover: function() {}
      }
    };

    deferredExtractedValues = $q.defer();
    spyOn(extractionService, 'extractForSourceValue').andReturn(deferredExtractedValues.promise);
    spyOn(cmsCodedValueService, 'findOneByCategoryIdParameterIdAndValue').andReturn($q.defer().promise);
    spyOn(cmsUnitService, 'findOneByCategoryIdParameterIdAndValue').andReturn($q.defer().promise);

    spyOn(angularGrowl, 'success').andCallThrough();
    spyOn(angularGrowl, 'error').andCallThrough();
    spyOn($window.parent.unsavedParam, 'addInferredParameter');
    spyOn($window.parent.unsavedParam, 'addRepeatableInferredParameter');
    spyOn($window.parent, 'closeExtractionPopover');
    spyOn(dialog, 'confirm').andReturn({
      result: dialogResult.promise
    });

    $controller('ExtractionController', {
      $scope: $scope,
      $location: $location,
      extractionService: extractionService,
      $window: $window,
      dialogs: dialog,
      cmsCodedValueService: cmsCodedValueService,
      cmsUnitService: cmsUnitService,
      standardizationService: standardizationService
    });

    // This method gets the input object from editspecs. So we are mocking it here with the values we are using in our test.
    // Any changes to there return value of getInputObjectByParameterId() in edit specs would require changes here.
    $scope.findElement = function(parameterId) {
      return mockElementObjects[parameterId];
    };

    $scope.findUnitGroup = function(parameterId) {
      return angular.element('<select inputid="pp_111_25698_0" parameter-name="Proc Speed"></select>');
    };

    mockElementObjects = {};
    mockElementObjects[2230522] = {
      element: {},
      parameterId: 2230522,
      parameterName: 'Processor Model',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };
    mockElementObjects[2239228] = {
      element: {},
      parameterId: 2239228,
      parameterName: 'Maximum Turbo Speed',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: false,
      unitValue: 'GHz',
      extractedValue: '',
      extractedDisplayValue: '[no value] GHz',
      extractedEcode: undefined
    };
    mockElementObjects[2229779] = {
      element: {},
      parameterId: 2229779,
      parameterName: 'Processor Speed',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };
    mockElementObjects[22268] = {
      element: {},
      parameterId: 22268,
      parameterName: 'Chipset Model',
      hasUnit: false,
      isNumber: false,
      isCoded: false,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: 'Data N/A',
      extractedEcode: '3'
    };
    mockElementObjects[2226064] = {
      element: {},
      parameterId: 2226064,
      parameterName: 'Memory Card Supported',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: true,
      extractedValue: 'Memory Stick',
      extractedDisplayValue: 'Memory Stick<hr>Data N/A',
      extractedEcode: 3
    };
    mockElementObjects[21751] = {
      element: {},
      parameterId: 21751,
      parameterName: 'Marketing Information',
      hasUnit: false,
      isNumber: false,
      isCoded: false,
      isRepeatable: false,
      extractedValue: '<p> <b>Live long and prosper</b> <br /> <br />42 is the answer to life, universe and everything thanks to its 4th-gen Intel® Core® i7 processor | NVIDIA® GeForce© GTX graphics. Especially with a pipe in data and spaces between tags for testing string comparision between extracted and inferred values</p>',
      extractedDisplayValue: '<p> <b>Live long and prosper</b> <br /> <br />42 is the answer to life, universe and everything thanks to its 4th-gen Intel® Core® i7 processor | NVIDIA® GeForce© GTX graphics. Especially with a pipe in data and spaces between tags for testing string comparision between extracted and inferred values</p>',
      extractedEcode: 3
    };
  }));

  it('should initialize scope', function() {
    expect($scope.processed).toBe(false);
    expect($scope.showMessage).toBe(false);

    expect($scope.model).toBeDefined();
    expect($scope.model.inferredValues).toBeDefined();
    expect($scope.model.inferredValues.length).toEqual(0);
    expect($scope.model.productId).toMatch(productId);
    expect($scope.model.attributeId).toMatch(attributeId);

    deferredExtractedValues.resolve({
      extraction: []
    });
    $scope.$digest();

    expect($scope.headers).toBeDefined();

    expect($scope.showMessage).toBe(true);
    expect($scope.processed).toBe(true);
  });

  it('should find inferred values for an item(parameterId|parameterValue)', function() {

    var inferredValues = {
      // 21995 will be skipped because it does not exist in mock elements array
      // 2226064 is inferred twice because it is repeatable parameter
      // 21751 will be skipped because it is already extracted. It covers the case for replacing spaces between html tags, and having pipe character in data
      extraction: [{
        parameterId: 2230522,
        value: 'i5-4200U'
      }, {
        parameterId: 21995,
        value: '1',
        unit: 'GB'
      }, {
        parameterId: 2229779,
        value: '2.8',
        unit: 'GHz'
      }, {
        parameterId: 2239228,
        value: '3.2',
        unit: 'GHz'
      }, {
        parameterId: 2226064,
        value: 'Secure Digital (SD)'
      }, {
        parameterId: 2226064,
        value: 'SDXC'
      }, {
        parameterId: 21751,
        value: '<p><b>Live long and prosper</b><br /><br />42 is the answer to life, universe and everything thanks to its 4th-gen Intel® Core® i7 processor | NVIDIA® GeForce© GTX graphics. Especially with a pipe in data and spaces between tags for testing string comparision between extracted and inferred values</p>'
      }]
    };
    deferredExtractedValues.resolve(inferredValues);
    $scope.$digest();

    expect($scope.model.inferredCount).toEqual(5);
    expect($scope.model.alreadyExtracted).toEqual(1);
    expect($scope.model.skipped).toEqual(1);

    // The sum of inferred, already extracted and skipped should always total to the number of inference results returned by server
    var resultCount = inferredValues.extraction.length;
    expect($scope.model.inferredCount + $scope.model.alreadyExtracted + $scope.model.skipped).toEqual(resultCount);

    expect(_.keys($scope.model.inferredValues).length).toEqual(2); // Two headers (there are three headers, but marketing information is skipped because same value already exists

  });

  it('should replace [no value] string in extractedDisplayValue)', function() {

    var inferredValues = {
      //  2239228 covers the [no value] case
      extraction: [{
        parameterId: 2239228,
        value: '3.2 GHz'
      }]
    };
    deferredExtractedValues.resolve(inferredValues);
    $scope.$digest();

    expect($scope.model.inferredCount).toEqual(1);

    // This object will return that one inferred object. Accessing that 1 element. Have to flatten array because inferredValue object has inferences are grouped by headers
    var inference = _.flatten(_.values($scope.model.inferredValues))[0];
    expect(inference.extractedDisplayValue).toNotContain(CONST.NO_VALUE);
    expect(inference.noValue).toBe(true);

  });

  describe('Accept and Reject', function() {
    var inferences;
    beforeEach(function() {
      // Setting inferred value in scope by the proper method because
      // Otherwise the properties will not be set correctly
      var inferredValues = {
        extraction: [{
          parameterId: 2230522,
          value: 'i5-4200U'
        }, {
          parameterId: 2239228,
          value: '3.2 GHz'
        }, {
          parameterId: 2226064,
          value: 'Secure Digital (SD)'
        }]
      };
      deferredExtractedValues.resolve(inferredValues);
      $scope.$digest();

      // Before accepting or rejecting, the scope should have two inferences and accepted count set to 0
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(3); // Three inferred values
      expect(_.keys($scope.model.inferredValues).length).toEqual(2); // Grouped by two headers
      expect($scope.model.inferredCount).toEqual(3);
      expect($scope.model.acceptedCount).toEqual(0);
      expect($scope.model.rejectedCount).toEqual(0);
    });

    it('should accept inferred value and close popover when all values are extracted', function() {
      // After accepting one value, the scope should have one inference left and accepted count set to 1
      var infer = _.find(inferences, {
        parameterId: 2230522
      });
      $scope.acceptInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.acceptedCount).toEqual(1);

      // Add inferred parameter should be called
      // Till this time close inference popover should not have been called because one inference is still in scope
      expect($window.parent.unsavedParam.addInferredParameter).toHaveBeenCalledWith(infer.element, infer);
      expect($window.parent.closeExtractionPopover).not.toHaveBeenCalled();

      // On accepting the second inference the inferences length should be 0, and accepted count equal to 2
      infer = _.find(inferences, {
        parameterId: 2239228
      });
      $scope.acceptInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(1);
      expect($scope.model.acceptedCount).toEqual(2);
      expect($window.parent.unsavedParam.addInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      $scope.acceptInference(_.find(inferences, {
        parameterId: 2226064
      }));

      // The header should also be removed and close popover should be called because length of keys of inferredValues (header count) is now 0
      expect(_.keys($scope.model.inferredValues).length).toEqual(0);
      expect($window.parent.closeExtractionPopover).toHaveBeenCalled();
    });

    it('should reject inferred value and close popover when all value are rejected', function() {
      var infer = _.find(inferences, {
        parameterId: 2230522
      });
      $scope.rejectInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.rejectedCount).toEqual(1);

      // Till this time close inference popover should not have been called because inferences are still in scope
      expect($window.parent.closeExtractionPopover).not.toHaveBeenCalled();

      // On rejecting the second inference the inferences length should be 1, and rejected count equal to 2
      infer = _.find(inferences, {
        parameterId: 2239228
      });
      $scope.rejectInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(1);
      expect($scope.model.rejectedCount).toEqual(2);

      // The header should also be removed
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSORCHIPSET);

      infer = _.find(inferences, {
        parameterId: 2226064
      });
      $scope.rejectInference(infer);
      // and close popover should be called because length of keys of inferredValues (header count) is now 0
      expect($window.parent.closeExtractionPopover).toHaveBeenCalled();
    });

    it('should accept repeatable inferred value and extract it', function() {
      var infer = _.find(inferences, {
        parameterId: 2226064
      });
      expect(infer.isRepeatable).toBe(true);

      $scope.acceptInference(infer);

      // Accepting repeatable parameter calls a separate method in edit specs, we are verifying this behavior here
      expect($window.parent.unsavedParam.addRepeatableInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      // After accepting one value, the scope should have 2 inferences left and accepted count set to 1
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.acceptedCount).toEqual(1);
    });

    it('should reject repeatable inferred value', function() {
      var infer = _.find(inferences, {
        parameterId: 2226064
      });
      expect(infer.isRepeatable).toBe(true);

      $scope.rejectInference(infer);

      // After accepting one value, the scope should have 2 inferences left and accepted count set to 1
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.rejectedCount).toEqual(1);
    });

    it('should accept all values in header', function() {
      var list = $scope.model.inferredValues[PROCESSORCHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.acceptAllInferredValuesInList(list);

      // Should make individual calls to addInferredParameter, one call per item in original list
      expect($window.parent.unsavedParam.addInferredParameter.calls.length).toEqual(count);
      expect($scope.model.acceptedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.inferredValues)).not.toContain(PROCESSORCHIPSET);
    });

    it('should reject all values in header', function() {
      var list = $scope.model.inferredValues[PROCESSORCHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.rejectAllInferredValuesInList(list); // not sending second argument, so its a falsey value, so it will reject without confirmation

      // Should make individual calls to addInferredParameter, one call per item in original list
      expect($scope.model.rejectedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSORCHIPSET);
    });

    it('should reject all values in header after confirmation', function() {
      var list = $scope.model.inferredValues[PROCESSORCHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.rejectAllInferredValuesInList(list, true);

      dialogResult.resolve(); // Resolving the dialog with true to simulate confirm by user
      $scope.$digest();

      expect($scope.model.rejectedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSORCHIPSET);
    });

    it('should not reject all values in header after cancelling confirmation dialog', function() {
      var list = $scope.model.inferredValues[PROCESSORCHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.rejectAllInferredValuesInList(list, true);

      dialogResult.reject(); // Rejecting the dialog to simulate cancel by user
      $scope.$digest();

      expect($scope.model.rejectedCount).toEqual(0);
    });

    it('should reject all values after confirmation', function() {
      $scope.rejectAllInferredValues();
      var inferredCount = $scope.model.inferredCount;

      dialogResult.resolve(); // Resolving the dialog with true to simulate confirm by user
      $scope.$digest();

      expect($scope.model.rejectedCount).toEqual(inferredCount);

      // After rejecting all, the inferredValues object should be empty (should not have any headers)
      expect(_.keys($scope.model.inferredValues).length).toEqual(0);
    });

    it('should not reject all values after cancelling confirmation dialog', function() {
      $scope.rejectAllInferredValues();
      var inferredCount = $scope.model.inferredCount;

      dialogResult.reject(); // Rejecting the dialog to simulate cancel by user
      $scope.$digest();

      // The sum of calls to reject parameter and reject repeatable parameter should equal the total number of inferred values
      expect($scope.model.rejectedCount).toEqual(0);

      // The inferred values object should still contain the same number of elements as inferredCount
      expect(_.flatten(_.values($scope.model.inferredValues)).length).toEqual(inferredCount);
    });

  });
});
