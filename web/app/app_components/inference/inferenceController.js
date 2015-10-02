'use strict';

var app = angular.module('inference', ['inference.service', 'inferredValue.model', 'inference.routes', 'ui.bootstrap', 'app.config', 'readMore', 'sdeutils', 'underscore', 'ngSanitize', 'dialogs.main', 'dialogs.default-translations']);

app.controller('InferenceController', function($scope, inferenceService, _, $window, $location, $log, InferredValue, dialogs, APP_CONFIG) {
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
      analyticsKey: $location.search().analyticsKey,
      skippedParameterIds: APP_CONFIG.skippedParameterIds // Defined in properties as an array of strings, used to skip parameters such as Manufacturer and Brand from being displayed in inference results
    };

    // Location search returns string if there is only one value, and an array if there are multiple values in the query parameter items
    // We have to check the type because if it is not object, we convert it into array before passing it to the map function
    var itemsArray = typeof($location.search().items) === 'object' ? $location.search().items : [$location.search().items];

    var items = _.map(itemsArray, function(item) {
      return decodeURIComponent(item);
    });
    $scope.findValues(items);
  }

  $scope.findValues = function(items) {
    $scope.model.inferredValues = [];
    var data = {
      items: items,
      analyticsKey: $scope.model.analyticsKey
    };

    inferenceService.findInferencedValuesByParameterIdAndValue(data, $scope.model.engineId).then(function(inferredValues) {
      _.each(inferredValues.inference, function(inference) {
        var paramId = inference.split('|')[0];
        var obj = $scope.findElement(paramId);
        if (obj && _.indexOf($scope.model.skippedParameterIds, paramId) === -1) {
          var inferred = new InferredValue(angular.extend(obj, {
            inferredValue: inference
          }));
          if (angular.isUndefined(inferred.relatedParameterIds) && inferred.isSameAsExtracted()) { // We don't skip relatedParameters here, they are skipped later
            $log.info('Skipping inference as it is same as extracted value', paramId);
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
      item.element = $window.parent.unsavedParam.getInputElementForParameterIdInRow(item.parameterId, row);
      $scope.acceptInference(item, false);
    });
  };

  /**
   * This method will return the related parameters at the same set number.
   * NOTE: The inferred item given as input parameter will not be in the list itself
   */
  $scope.findSet = function(infer) {
    if (infer.relatedParameterIds) {
      return _.filter($scope.model.inferredValues[infer.headerId], function(item) {
        return item.setNo === infer.setNo && _.contains(infer.relatedParameterIds, item.parameterId); // Will return true if the parameter is related to the input parameter, and is at the same set number
      });
    }
    return [];
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
    var relatedParameters = [];
    angular.forEach(list, function(inference) {
      // If the inference does not have any related parameter ids, we can accept id right away, otherwise we will call the acceptInferenceSet() method, but only once per set
      if (angular.isUndefined(inference.setNo)) {
        $scope.acceptInference(inference);
      } else {
        relatedParameters.push(inference);
      }
    });

    // We are grouping the inferences by attribute id, and set no. We will call accept set once for each set no of unique attribute id
    var sets = _.groupBy(relatedParameters, function(infer) {
      return infer.attributeId + '_' + infer.setNo;
    });
    _.each(sets, function(set) {
      $scope.acceptInferenceSet(set[0]);
    });
  };

  $scope.isEmpty = function(str) {
    return str === undefined || str === null || str.trim() === '';
  };

  var MAX_SET_NUMBER = 50; // Defining the magic number here, because it is only used in this one function
  /**
   * This method groups inferred values by headers, and the values are sorted within headers by parameter display order in CMS. However parameters which have other related parameters are grouped by set number first, and then are sorted within sets
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

    var filteredList = _.difference(list, result);
    var attributes = _.groupBy(filteredList, 'attributeId');
    var filtered = _.map(attributes, function(attList, attributeId) {
      var sets = _.groupBy(attList, 'setNo');
      var extractedDisplayValues = $scope.getExtractedDisplayValues(sets[0]);
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
   * This can be used to check if the inferred set already exists
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
      $window.parent.closeInferencePopover();
    }
  };

  init();

});
