'use strict';

var app = angular.module('extraction', ['extraction.service', 'extraction.routes', 'extractedValue.model', 'taxonomy', 'cmsCodedValue.service', 'cmsUnit.service', 'standardization.service', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize', 'dialogs.main', 'dialogs.default-translations']);

app.controller('ExtractionController', function($scope, extractionService, ExtractedValue, cmsCodedValueService, cmsUnitService, standardizationService, _, $window, $location, $q, $log, dialogs) {
  $scope.showMessage = false;
  $scope.processed = false;
  $scope.checkingNonStandardPromises = [];

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
          if (angular.isUndefined(inferred.relatedParameterIds) && inferred.isSameAsExtracted()) {
            $log.info('Skipping extraction as it is same as extracted value', paramId);
            $scope.model.alreadyExtracted++;
          } else {
            inferred.headerId = $window.parent.parameterHeaderMap[paramId];
            if (inferred.relatedParameterIds) {
              inferred.setNo = _.where($scope.model.inferredValues, {
                parameterId: inferred.parameterId
              }).length;
            }
            $scope.model.inferredValues.push(inferred);
            $scope.model.inferredCount++;
          }
          // For all extracted coded values and units, we check if they are standardized (taxonomy service)
          if (!inferred.standardized && (inferred.isCoded || inferred.hasUnit || inferred.isUnitType)) {
            $scope.checkNonStandard(inferred);
          }
        } else {
          $scope.model.skipped++;
          $log.info('Skipping extraction as parameter does not exist on page', paramId);
        }
      });

      // SDE-2278 Skipping already extracted sets once again after the standardized value calls are all resolved
      $q.all($scope.checkingNonStandardPromises).then(function() {
        $scope.model.inferredValues = $scope.sort($scope.model.inferredValues);
        $scope.showMessage = _.keys($scope.model.inferredValues).length === 0; // Setting message if all values are already extracted
      });

      $scope.headers = $window.parent.headerSortOrder;
      // Group by headers and sort them by header order
      $scope.model.inferredValues = $scope.sort(_.groupBy($scope.model.inferredValues, 'headerId'));

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

  // SDE-2142: In the case of repeatable attributes, we are adding a second boolean parameter. If it is true, we call the replaceRepeatableParmeter method in Edit Specs instead of addRepeatableParameter
  $scope.acceptInference = function(infer, replace) {
    // This object unsavedParam is a global object of editSpecs which keeps track of the unsaved parameter.
    // So whenever we change a parameter, we have to add the element to this object.
    if (infer.isRepeatable && !infer.relatedParameterIds) {
      if (replace === true) {
        $window.parent.unsavedParam.replaceRepeatableInferredParameter(infer.element, infer);
      } else {
        $window.parent.unsavedParam.addRepeatableInferredParameter(infer.element, infer);
      }
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

  /**
   * Inference objects for parameters which have related parameters will be accepted as a set using this method.
   * The method will first put the set of inferences which are at the same set number in an array, and will then call accept inference one each object after switching reference element to that of the target row.
   */
  $scope.acceptInferenceSet = function(infer) {
    var row = $window.parent.unsavedParam.getRowForSet(infer.element, infer);

    var set = $scope.findSet(infer);
    set.push(infer);

    _.each(set, function(item) {

      /* Here we check that the extracted value is a standard value. We can only accept standardized values
       The value returned by extraction service has the standardized flag set to true, we never change this value anywhere in our code
      OR if the isNonStandard field exists and is set to false. This field only exists when item.standardized is set ot false, and the check with taxonomy service finds a standardized value
      OR if the extracted value does not belong to coded, unit or unit type. (We check standardized value only for these type. Other types such as numeric and text would always be extracted */
      if (item.standardized || (!item.standardized && item.isNonStandard === false) || (!item.isCoded && !item.hasUnit && !item.isUnitType)) {
        item.element = $window.parent.unsavedParam.getInputElementForParameterIdInRow(item.parameterId, row);
        $scope.acceptInference(item, false);
      } else {
        $log.info('Skipping non-standard value ' + item.displayValue + ' in set for parameter id ' + item.parameterId);
      }
    });
  };

  /**
   * This method will return the related parameters at the same set number.
   * NOTE: The inferred item given as input parameter will not be in the list itself
   */
  $scope.findSet = function(infer) {
    if (infer.relatedParameterIds) {
      return _.filter($scope.model.inferredValues[infer.headerId], function(item) {
        // Converting item.parameterId to string for this comparision. Because for extraction, the parameterId is stored as an integer, but picking it up from edit specs returns a string by default.
        return item.setNo === infer.setNo && _.contains(infer.relatedParameterIds, item.parameterId + ''); // Will return true if the parameter is related to the input parameter, and is at the same set number
      });
    }
    return [];
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
    var relatedParameters = [];
    angular.forEach(list, function(inference) {
      if (inference.isNonStandard !== true) {
        // If the inference does not have any related parameter ids, we can accept id right away, otherwise we will call the acceptInferenceSet() method, but only once per set
        if (angular.isUndefined(inference.setNo)) {
          $scope.acceptInference(inference, false);
        } else {
          relatedParameters.push(inference);
        }
      } else {
        $log.info('Accept-All is skipping non-standard value ' + inference.displayValue + ' for parameter ' + inference.parameterId);
      }
    });

    // We are grouping the inferences by attribute id, and set no. We will call accept set once for each set no of unique attribute id
    _.each(_.groupBy(relatedParameters, function(infer) {
      return infer.attributeId + '_' + infer.setNo;
    }), function(set) {
      $scope.acceptInferenceSet(set[0]);
    });
  };

  $scope.isEmpty = function(str) {
    return str === undefined || str === null || str.trim() === '';
  };

  var MAX_SET_NUMBER = 50; // Defining the magic number here, because it is only used in this one function
  /**
   * This method groups extracted values by headers, and the values are sorted within headers by parameter display order in CMS. However parameters which have other related parameters are grouped by set number first, and then are sorted within sets
   */
  $scope.sort = function(inferredValues) {
    // This will create a sorted array of attributeIds (sorted on the attribute order in template, not on on the id)
    var attributeIds = _.sortBy(_.uniq(_.pluck(_.flatten(_.values(inferredValues)), 'attributeId')), function(attributeId) {
      return $window.parent.parameterSortOrder.indexOf(_.findWhere(_.flatten(_.values(inferredValues)), {
        'attributeId': attributeId
      }).parameterId);
    });

    // This will create a sorted array of headerIds which are present in this result set
    var headerIds = _.pluck($scope.headers, 'headerId');
    var keys = _.sortBy(_.keys(inferredValues), function(key) {
      return headerIds.indexOf(key);
    });
    var result = {};
    _.each(keys, function(key) {
      var filteredList = $scope.filterAlreadyExtractedSets(inferredValues[key]);
      // Skipping header altogether if there are no values left in it after filtering
      if (filteredList && filteredList.length > 0) {
        // We first group the results by attributeId, and then within the sorted attributeIds, group them by sets and within sets sort by parameterId
        var attGroups = _.groupBy(filteredList, 'attributeId');
        result[key] = _.reduce(_.sortBy(_.keys(attGroups), function(id) {
          return _.indexOf(attributeIds, id);
        }), function(result, attributeId) {
          return result.concat(_.sortBy(attGroups[attributeId], function(obj) {
            var setNo = obj.setNo + 1 || MAX_SET_NUMBER; // This will return 1 indexed set number, or a very large number 50 which cannot occur for set number. Adding this number to our sorting order will ensure that parameters are grouped by set number, and then sorted on the parameter sort order. And all parameters with undefined set number will occur at the end of sort list
            return $window.parent.parameterSortOrder.indexOf(obj.parameterId) * setNo;
          }));
        }, []);
      }
    });
    return result;
  };

  // This method is called once per header
  $scope.filterAlreadyExtractedSets = function(list) {
    // Moving all non related parameters directly to result array
    var result = _.filter(list, function(inference) {
      return angular.isUndefined(inference.setNo);
    });

    var filtered = _.map(_.groupBy(_.difference(list, result), 'attributeId'), function(attList, attributeId) {
      var sets = _.groupBy(attList, 'setNo');
      var extractedDisplayValues = $scope.getExtractedDisplayValues(_.first(_.values(sets)));
      var filteredSets = _.reduce(sets, function(result, set) {
        if (_.contains(extractedDisplayValues, _.pluck(set, 'displayValue').join(''))) {
          $scope.model.alreadyExtracted += set.length;
          $log.info('Skipping set of inferences for attribute id ' + attributeId + ' as the same values are already extracted', _.pluck(set, 'parameterId').join());
          return result;
        } else {
          return result.concat(set);
        }
      }, []);
      return filteredSets;
    });
    return _.compact(_.flatten(_.union(result, filtered)));
  };

  $scope.setHighlight = function(header, infer) {
    if (infer === null) {
      delete header.highlight;
    } else {
      header.highlight = {
        attributeId: infer.attributeId,
        setNo: infer.setNo
      };
    }
  };

  /**
   * This function will iterate through the list of inferences, and pluck the extracted display values of each.
   * Then if the extracted display values are of repeatable parameters, they will be split, and then each set would be concatenated separately.
   * The return value is a list of concatenated extracted display values of the parameters in the set.
   *
   * Example: If attribute has 3 parameters out of 4 filled, and three sets are extracted. The extracted display values would be like
   * Param 1: 1<hr>1<hr>2
   * Param 2: Automatic Document Feeder<hr>Cassette<hr>Output Tray
   * Param 3: Sheet<hr>Sheet<hr>Sheet
   * Param 4 is blank
   *
   * We will return an array of strings like ['1Automatic Document FeederSheet', '1CassetteSheet', '2Output TraySheet']
   * This can be used to check if the set already exists
   */
  $scope.getExtractedDisplayValues = function(list) {
    return _.map(_.zip(_.map(_.pluck(list, 'extractedDisplayValue'), function(edv) {
      return edv.split('<hr>');
    })), function(arr) {
      return (arr || []).join('');
    }) || [];
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
    if (!infer.showStandardization) {
      var obj = {
        categoryId: $scope.model.categoryId,
        parameterId: infer.parameterId,
        value: infer.hasUnit ? infer.targetUnit : infer.value
      };
      infer.loadingStandardValues = true;

      var promise = (infer.hasUnit || infer.isUnitType) ? cmsUnitService.findUnitValuesByCategoryIdAndParameterId(obj) : cmsCodedValueService.findCodedValuesByCategoryIdAndParameterId(obj);
      promise.then(function(data) {
        infer.standardValues = infer.isCoded ? data : getStandardValues(data);
        infer.filteredStandardValues = infer.isCoded ? data : getStandardValues(data);
        infer.loadingStandardValues = false;
      });
    }
    infer.showStandardization = !infer.showStandardization;
  };

  // The unit service returns units like { name: 'GHz' } while the coded value service returns the values in { value: 'Intel'} format
  // This function will rename "name" label of units to "value" so that the UI can be bound to the same label
  function getStandardValues(data) {
    return _.map(data, function(item) {
      return {
        'value': item.name
      };
    });
  }

  $scope.addStandardization = function(inference, replace, accept) {
    if (inference.standardValue) {
      var data = {};
      if (inference.hasUnit) {
        data[inference.targetUnit] = inference.standardValue;
        inference.targetUnit = inference.standardValue;
      } else {
        data[inference.targetValue] = inference.standardValue;
        inference.targetValue = inference.standardValue;
      }
      standardizationService.addVariations(inference.parameterId, data).then(function() {}, function() {
        $log.warn('Could not save standard value ' + inference.standardValue + ' for parameterId' + inference.parameterId);
      }).finally(function() {
        // Accepting inference in finally block because we accept in both success and failure cases, because we already know that the value user selected is valid, and can be accepted. The only issue with failure is that this value will still be displayed as non-standard value the next time it is extracted.
        if (accept === true) {
          $scope.acceptInference(inference, replace);
        } else {
          // Updating UI state
          inference.isNonStandard = false;
          inference.showStandardization = false;
          inference[inference.hasUnit ? 'updateUnit' : 'updateValue'](inference.standardValue);
        }
      });
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
      value: infer.hasUnit ? infer.targetUnit : infer.value // Please note that values with isUnitType are going into the else case
    };

    // We are setting the applicable service in a local variable, so that we have to write the callback only once
    var service = (infer.hasUnit || infer.isUnitType) ? cmsUnitService : cmsCodedValueService;
    var promise = service.findOneByCategoryIdParameterIdAndValue(obj);
    $scope.checkingNonStandardPromises.push(promise);
    promise.then(function(data) {
      if (data[0] && data[0].active === true) {
        infer.isNonStandard = false;
        // Using the coded value / unit name from standardization service, to ensure standard capitalization
        // Standardization service does case insensitive comparison, but returns the response with correct case
        infer[infer.hasUnit ? 'updateUnit' : 'updateValue'](data[0].value || data[0].name);
      } else {
        infer.isNonStandard = true;
      }
      infer.checkingNonStandard = false;
    }, function() {
      $log.warn('Could not check standarization for Parameter Id ' + obj.parameterId + ' with value ' + obj.value);
      infer.checkingNonStandard = false;
    });
  };

  $scope.searchStandardValueInList = function(infer) {
    infer.searchString = $window.prompt('Search In List') || '';
    if (infer.searchString) {
      var searchString = infer.searchString.toLowerCase();
      var filteredValues = _.filter(infer.standardValues, function(item) {
        return item.value.toLowerCase().indexOf(searchString) > -1;
      });

      if (filteredValues && filteredValues.length === 1) {
        // If we have only one candidate match, then we select that value, and reset the search string
        infer.standardValue = filteredValues[0].value;
        infer.searchString = '';
        infer.filteredStandardValues = infer.standardValues;
      } else {
        // Otherwise we set the filtered list in scope
        infer.filteredStandardValues = filteredValues;
        delete infer.standardValue;
      }
    }
  };

  $scope.clearSearchFilter = function(infer) {
    infer.searchString = '';
    infer.filteredStandardValues = infer.standardValues;
  };

  init();

});
