'use strict';

describe('Controller: InferenceContoller', function() {

  beforeEach(module('inference'));
  beforeEach(module('app.constants'));
  beforeEach(module('uiRouterNoop'));

  var $scope, $rootScope, $location, $window, inferenceService, deferredInferredValues, angularGrowl, engineId, analyticsKey, mockElementObjects, CONST, dialog, dialogResult, PROCESSOR_CHIPSET, GENERAL_INFORMATION, MEMORY, MEDIA_TYPES_AND_HANDLING;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$rootScope_, $controller, _$location_, $q, APP_CONFIG, growl, _CONST_) {
    $rootScope = _$rootScope_;
    $location = _$location_;
    $scope = $rootScope.$new();
    angularGrowl = growl;
    CONST = _CONST_;

    // Header Ids
    PROCESSOR_CHIPSET = 72;
    GENERAL_INFORMATION = 35;
    MEMORY = 52;
    MEDIA_TYPES_AND_HANDLING = 51;

    dialogResult = $q.defer();
    dialog = {
      confirm: function() {},
      result: function() {}
    };

    engineId = '79cbf55f-5ffc-424d-b265-6991fd4149b4';
    analyticsKey = '10000142';

    inferenceService = {
      findInferencedValuesByParameterIdAndValue: function() {}
    };

    // pass state to search controller
    $location.search({
      items: ['2225938|Netbook'],
      engineId: '79cbf55f-5ffc-424d-b265-6991fd4149b4',
      analyticsKey: '10000142'
    });

    /**
     * Inference controller depends on a lot of globals defined in edit specs, which are accessed in the iframe using $window.parent
     * We are mocking those variables and methods here.
     * Any logic changes in edit specs affecting these variables should be accompanied by same changes in these mocks.
     */
    $window = {
      parent: {
        getInputObjectByParameterId: function(parameterId) {
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
          21751: GENERAL_INFORMATION,
          2230522: PROCESSOR_CHIPSET,
          2229779: PROCESSOR_CHIPSET,
          2239228: PROCESSOR_CHIPSET,
          22268: PROCESSOR_CHIPSET,
          22269: MEMORY,
          2226064: MEMORY,
          2235783: MEDIA_TYPES_AND_HANDLING,
          23749: MEDIA_TYPES_AND_HANDLING,
          2229670: MEDIA_TYPES_AND_HANDLING,
          2229672: MEDIA_TYPES_AND_HANDLING,
          2229845: MEDIA_TYPES_AND_HANDLING,
          2229848: MEDIA_TYPES_AND_HANDLING,
          2229846: MEDIA_TYPES_AND_HANDLING,
          2227433: MEDIA_TYPES_AND_HANDLING,
          2227432: MEDIA_TYPES_AND_HANDLING,
          2229847: MEDIA_TYPES_AND_HANDLING,
          2230654: MEDIA_TYPES_AND_HANDLING
        },
        headerSortOrder: [{
          headerId: GENERAL_INFORMATION,
          headerName: 'General Information'
        }, {
          headerId: PROCESSOR_CHIPSET,
          headerName: 'Processor & Chipset'
        }, {
          headerId: MEMORY,
          headerName: 'Memory'
        }, {
          headerId: MEDIA_TYPES_AND_HANDLING,
          headerName: 'Media Types & Handling'
        }],
        parameterSortOrder: [21751, 2230522, 2229779, 2239228, 22268, 22269, 2226064, 2235783, 23749, 2229670, 2229672, 2229845, 2229848, 2229846, 2227433, 2227432, 2229847, 2230654],
        unsavedParam: {
          addInferredParameter: function() {},
          addRepeatableInferredParameter: function() {},
          replaceRepeatableInferredParameter: function() {},
          rejectInferredParameter: function() {},
          rejectRepeatableInferredParameter: function() {}
        },
        closeInferencePopover: function() {}
      }
    };

    deferredInferredValues = $q.defer();
    spyOn(inferenceService, 'findInferencedValuesByParameterIdAndValue').andReturn(deferredInferredValues.promise);
    spyOn(angularGrowl, 'success').andCallThrough();
    spyOn(angularGrowl, 'error').andCallThrough();
    spyOn($window.parent.unsavedParam, 'addInferredParameter');
    spyOn($window.parent.unsavedParam, 'addRepeatableInferredParameter');
    spyOn($window.parent.unsavedParam, 'replaceRepeatableInferredParameter');
    spyOn($window.parent.unsavedParam, 'rejectInferredParameter');
    spyOn($window.parent.unsavedParam, 'rejectRepeatableInferredParameter');
    spyOn($window.parent, 'closeInferencePopover');
    spyOn(dialog, 'confirm').andReturn({
      result: dialogResult.promise
    });

    var attrs = {
      engine: engineId
    };

    $controller('InferenceController', {
      $scope: $scope,
      $location: $location,
      inferenceService: inferenceService,
      $attrs: attrs,
      $window: $window,
      dialogs: dialog
    });

    // This method gets the input object from editspecs. So we are mocking it here with the values we are using in our test.
    // Any changes to there return value of getInputObjectByParameterId() in edit specs would require changes here.
    $scope.findElement = function(parameterId) {
      return mockElementObjects[parameterId];
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
    mockElementObjects[22269] = {
      element: {},
      parameterId: 22269,
      parameterName: 'Maximum Memory',
      hasUnit: false,
      isNumber: false,
      isCoded: false,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
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
      extractedEcode: undefined
    };
    mockElementObjects[2235783] = {
      element: {},
      parameterId: 2235783,
      parameterName: 'Status: Borderless Printing',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };
    mockElementObjects[23749] = {
      element: {},
      parameterId: 23749,
      parameterName: 'Media Standard: Media Size',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['2229672', '2229670', '2229452']
    };
    mockElementObjects[2229670] = {
      element: {},
      parameterId: 2229670,
      parameterName: 'Maximum Horizontal Size: Media Size',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['23749', '2229672', '2229452']
    };
    mockElementObjects[2229672] = {
      element: {},
      parameterId: 2229672,
      parameterName: 'Maximum Vertical Size: Media Size',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['23749', '2229670', '2229452']
    };
    mockElementObjects[2229845] = {
      element: {},
      parameterId: 2229845,
      parameterName: 'Total Media Trays: Media Handling',
      hasUnit: false,
      isNumber: true,
      isCoded: false,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['2229846', '2229847', '2229848']
    };
    mockElementObjects[2229848] = {
      element: {},
      parameterId: 2229848,
      parameterName: 'Media Type: Media Handling',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['2229845', '2229846', '2229847']
    };
    mockElementObjects[2229846] = {
      element: {},
      parameterId: 2229846,
      parameterName: 'Media Tray Type: Media Handling',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['2229845', '2229847', '2229848']
    };
    mockElementObjects[2227433] = {
      element: {},
      parameterId: 2227433,
      parameterName: 'Percentage: Post-consumer',
      hasUnit: false,
      isNumber: true,
      isCoded: false,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };
    mockElementObjects[2227432] = {
      element: {},
      parameterId: 2227432,
      parameterName: 'Material: Recycled Content',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };
    mockElementObjects[2229847] = {
      element: {},
      parameterId: 2229847,
      parameterName: 'Media Capacity: Media Handling',
      hasUnit: false,
      isNumber: true,
      isCoded: false,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined,
      relatedParameterIds: ['2229845', '2229846', '2229848']
    };
    mockElementObjects[2230654] = {
      element: {},
      parameterId: 2230654,
      parameterName: 'Transmission Time: Transmission Speed',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: true,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };

  }));

  it('should initialize scope', function() {

    expect($scope.processed).toBe(false);
    expect($scope.showMessage).toBe(false);

    expect($scope.model).toBeDefined();
    expect($scope.model.inferredValues).toBeDefined();
    expect($scope.model.inferredValues.length).toEqual(0);
    expect($scope.model.engineId).toMatch(engineId);
    expect($scope.model.analyticsKey).toMatch(analyticsKey);
    expect($scope.model.skippedParameterIds).toBeDefined();
    expect($scope.model.skippedParameterIds.length).toEqual(1);
    expect($scope.model.skippedParameterIds).toContain('21748');

    deferredInferredValues.resolve({
      inference: []
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
      // 22268 covers the case for matching exception code
      inference: ['2230522|i5-4200U', '21995|1 GB', '2229779|2.8 GHz', '2239228|3.2 GHz', '2226064|Secure Digital (SD)', '2226064|SDXC', '22268|_EX_3', '21751|<p><b>Live long and prosper</b><br /><br />42 is the answer to life, universe and everything thanks to its 4th-gen Intel® Core® i7 processor | NVIDIA® GeForce© GTX graphics. Especially with a pipe in data and spaces between tags for testing string comparision between extracted and inferred values</p>']
    };
    deferredInferredValues.resolve(inferredValues);
    $scope.$digest();

    expect($scope.model.inferredCount).toEqual(5);
    expect($scope.model.alreadyExtracted).toEqual(2);
    expect($scope.model.skipped).toEqual(1);

    // The sum of inferred, already extracted and skipped should always total to the number of inference results returned by server
    var resultCount = inferredValues.inference.length;
    expect($scope.model.inferredCount + $scope.model.alreadyExtracted + $scope.model.skipped).toEqual(resultCount);

    expect(_.keys($scope.model.inferredValues).length).toEqual(2); // Two headers (there are three headers, but marketing information is skipped because same value already exists

  });

  it('should replace [no value] string in extractedDisplayValue)', function() {

    var inferredValues = {
      //  2239228 covers the [no value] case
      inference: ['2239228|3.2 GHz']
    };
    deferredInferredValues.resolve(inferredValues);
    $scope.$digest();

    expect($scope.model.inferredCount).toEqual(1);

    // This object will return that one inferred object. Accessing that 1 element. Have to flatten array because inferredValue object has inferences are grouped by headers
    var inference = _.flatten(_.values($scope.model.inferredValues))[0];
    expect(inference.extractedDisplayValue).toNotContain(CONST.NO_VALUE);
    expect(inference.noValue).toBe(undefined);

  });

  describe('Controller: Inference Controller - Repeatable parameters', function() {
    var inferences;
    beforeEach(function() {
      // Setting inferred value in scope by the proper method because
      // Otherwise the properties will not be set correctly
      var inferredValues = {
        inference: ['2230522|i5-4200U', '2239228|3.2 GHz', '2226064|Secure Digital (SD)']
      };
      deferredInferredValues.resolve(inferredValues);
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
        parameterId: '2230522'
      });
      $scope.acceptInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.acceptedCount).toEqual(1);

      // Add inferred parameter should be called
      // Till this time close inference popover should not have been called because one inference is still in scope
      expect($window.parent.unsavedParam.addInferredParameter).toHaveBeenCalledWith(infer.element, infer);
      expect($window.parent.closeInferencePopover).not.toHaveBeenCalled();

      // On accepting the second inference the inferences length should be 0, and accepted count equal to 2
      infer = _.find(inferences, {
        parameterId: '2239228'
      });
      $scope.acceptInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(1);
      expect($scope.model.acceptedCount).toEqual(2);
      expect($window.parent.unsavedParam.addInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      $scope.acceptInference(_.find(inferences, {
        parameterId: '2226064'
      }));

      // The header should also be removed and close popover should be called because length of keys of inferredValues (header count) is now 0
      expect(_.keys($scope.model.inferredValues).length).toEqual(0);
      expect($window.parent.closeInferencePopover).toHaveBeenCalled();
    });

    it('should reject inferred value and close popover when all value are rejected', function() {
      var infer = _.find(inferences, {
        parameterId: '2230522'
      });
      $scope.rejectInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.rejectedCount).toEqual(1);

      // Till this time close inference popover should not have been called because inferences are still in scope
      expect($window.parent.closeInferencePopover).not.toHaveBeenCalled();
      expect($window.parent.unsavedParam.rejectInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      // On rejecting the second inference the inferences length should be 1, and rejected count equal to 2
      infer = _.find(inferences, {
        parameterId: '2239228'
      });
      $scope.rejectInference(infer);
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(1);
      expect($scope.model.rejectedCount).toEqual(2);

      // The header should also be removed
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSOR_CHIPSET);
      expect($window.parent.unsavedParam.rejectInferredParameter.callCount).toEqual(2);
      expect($window.parent.unsavedParam.rejectInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      infer = _.find(inferences, {
        parameterId: '2226064'
      });
      $scope.rejectInference(infer);
      // and close popover should be called because length of keys of inferredValues (header count) is now 0
      expect($window.parent.closeInferencePopover).toHaveBeenCalled();
    });

    it('should accept repeatable inferred value and extract it', function() {
      var infer = _.find(inferences, {
        parameterId: '2226064'
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

    it('should replace repeatable inferred value and extract it', function() {
      var infer = _.find(inferences, {
        parameterId: '2226064'
      });
      expect(infer.isRepeatable).toBe(true);

      $scope.acceptInference(infer, true); // Sending true as the second parameter to trigger replace flow

      // Accepting repeatable parameter calls a separate method in edit specs, we are verifying this behavior here
      expect($window.parent.unsavedParam.replaceRepeatableInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      // After accepting one value, the scope should have 2 inferences left and accepted count set to 1
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.acceptedCount).toEqual(1);
    });

    it('should reject repeatable inferred value', function() {
      var infer = _.find(inferences, {
        parameterId: '2226064'
      });
      expect(infer.isRepeatable).toBe(true);

      $scope.rejectInference(infer);

      // Accepting repeatable parameter calls a separate method in edit specs, we are verifying this behavior here
      expect($window.parent.unsavedParam.rejectRepeatableInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      // After accepting one value, the scope should have 2 inferences left and accepted count set to 1
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(2);
      expect($scope.model.rejectedCount).toEqual(1);
    });

    it('should accept all values in header', function() {
      var list = $scope.model.inferredValues[PROCESSOR_CHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.acceptAllInferredValuesInList(list);

      // Should make individual calls to addInferredParameter, one call per item in original list
      expect($window.parent.unsavedParam.addInferredParameter.calls.length).toEqual(count);
      expect($scope.model.acceptedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.inferredValues)).not.toContain(PROCESSOR_CHIPSET);
    });

    it('should reject all values in header', function() {
      var list = $scope.model.inferredValues[PROCESSOR_CHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.rejectAllInferredValuesInList(list); // not sending second argument, so its a falsey value, so it will reject without confirmation

      // Should make individual calls to addInferredParameter, one call per item in original list
      expect($window.parent.unsavedParam.rejectInferredParameter.calls.length).toEqual(count);
      expect($scope.model.rejectedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSOR_CHIPSET);
    });

    it('should reject all values in header after confirmation', function() {
      var list = $scope.model.inferredValues[PROCESSOR_CHIPSET]; // Getting all for Processor & Chipset
      var count = list.length;
      $scope.rejectAllInferredValuesInList(list, true);

      dialogResult.resolve(); // Resolving the dialog with true to simulate confirm by user
      $scope.$digest();

      // Should make individual calls to rejectInferredParameter, one call per item in original list
      expect($window.parent.unsavedParam.rejectInferredParameter.calls.length).toEqual(count);
      expect($scope.model.rejectedCount).toEqual(count);

      // After accepting header list should not contain this header
      expect(_.keys($scope.model.inferredValues)).not.toContain(PROCESSOR_CHIPSET);
    });

    it('should not reject all values in header after cancelling confirmation dialog', function() {
      var list = $scope.model.inferredValues[PROCESSOR_CHIPSET]; // Getting all for Processor & Chipset
      $scope.rejectAllInferredValuesInList(list, true);

      dialogResult.reject(); // Rejecting the dialog to simulate cancel by user
      $scope.$digest();

      // Should not have made any calls to rejectInferredParameter because we cancelled the dialog
      expect($window.parent.unsavedParam.rejectInferredParameter).not.toHaveBeenCalled();
      expect($scope.model.rejectedCount).toEqual(0);
    });

    it('should reject all values after confirmation', function() {
      $scope.rejectAllInferredValues();
      var inferredCount = $scope.model.inferredCount;

      dialogResult.resolve(); // Resolving the dialog with true to simulate confirm by user
      $scope.$digest();

      // The sum of calls to reject parameter and reject repeatable parameter should equal the total number of inferred values
      expect($window.parent.unsavedParam.rejectInferredParameter.calls.length + $window.parent.unsavedParam.rejectRepeatableInferredParameter.calls.length).toEqual(inferredCount);
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
      expect($window.parent.unsavedParam.rejectInferredParameter.calls.length).toEqual(0);
      expect($window.parent.unsavedParam.rejectRepeatableInferredParameter.calls.length).toEqual(0);
      expect($scope.model.rejectedCount).toEqual(0);

      // The inferred values object should still contain the same number of elements as inferredCount
      expect(_.flatten(_.values($scope.model.inferredValues)).length).toEqual(inferredCount);
    });

  });

  // Adding test for value containing exception code.
  // Adding a new describe block because if I add this to the block above, I will have to change all the existing tests
  describe('Controller: InferenceController - exception code', function() {
    var inferences;
    beforeEach(function() {
      // Setting inferred value in scope by the proper method because
      // Otherwise the properties will not be set correctly
      var inferredValues = {
        inference: ['2230522|i5-4200U', '2239228|3.2 GHz', '2226064|Secure Digital (SD)', '22269|_EX_3']
      };
      deferredInferredValues.resolve(inferredValues);
      $scope.$digest();

      // Before accepting or rejecting, the scope should have two inferences and accepted count set to 0
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(4); // Four inferred values hanging on the wall
      expect(_.keys($scope.model.inferredValues).length).toEqual(2); // Grouped by two headers
      expect($scope.model.inferredCount).toEqual(4);
      expect($scope.model.acceptedCount).toEqual(0);
      expect($scope.model.rejectedCount).toEqual(0);
    });

    it('should accept inferred value containing exception code and extract it', function() {
      var infer = _.find(inferences, {
        parameterId: '22269'
      });
      expect(infer.hasExceptionCode).toBe(true);
      expect(infer.targetEcode).toBeDefined();
      expect(infer.targetEcode).toEqual('3');
      expect(infer.displayValue).toMatch('Data N/A');

      $scope.acceptInference(infer);

      // Accepting repeatable parameter calls a separate method in edit specs, we are verifying this behavior here
      expect($window.parent.unsavedParam.addInferredParameter).toHaveBeenCalledWith(infer.element, infer);

      // After accepting one value, the scope should have 2 inferences left and accepted count set to 1
      inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toEqual(3);
      expect($scope.model.acceptedCount).toEqual(1);
    });
  });

  // This block will describe the controller functionality dealing with related parameter sets
  describe('Controller: Inference Controller - Related Parameter Sets', function() {
    beforeEach(function() {

      // Setting inferred value in scope by the proper method because
      // Otherwise the properties will not be set correctly
      var inferredValues = {
        inference: ['2235783|Yes', '23749|A4', '23749|A5', '23749|Letter', '23749|B5', '2229670|210 mm', '2229670|148 mm', '2229670|216 mm', '2229670|250 mm', '2229672|297 mm', '2229672|210 mm', '2229672|279 mm', '2229672|353 mm', '2229845|1', '2229845|1', '2229845|1', '2229848|Sheet', '2229848|Sheet', '2229848|Sheet', '2229846|Automatic Document Feeder', '2229846|Cassette', '2227433|_EX_3', '2227432|_EX_3', '2229847|30', '2229846|Output Tray', '2229847|150', '2230654|3 sec/page', '2229847|100']
      };
      deferredInferredValues.resolve(inferredValues);
      $scope.$digest();

    });

    it('should assign set numbers to parameter objects containing related parameters', function() {
      var inferences = _.flatten(_.values($scope.model.inferredValues));
      expect(inferences.length).toBe(28);
      _.each(inferences, function(infer) {
        if (infer.relatedParameterIds) {
          expect(infer.setNo).toBeDefined();
        }
      });
    });
  });
});
