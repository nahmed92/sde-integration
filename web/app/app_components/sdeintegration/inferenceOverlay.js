'use strict';

/*jshint unused:false*/
function getInference(obj) {

  // If parameter has unit value, we concatenate the unit value, after normalizing numeric values
  var normalizedValue = obj.value;
  if (obj.hasUnit) {
    normalizedValue = parseFloat(obj.value) + ' ' + obj.unitValue;
  } else if (obj.isNumber) {
    normalizedValue = parseFloat(obj.value);
  }

  var scope = angular.element('#inference-container').scope();
  scope.parameterName = obj.parameterName;
  scope.selectedValue = normalizedValue;
  scope.findValues(obj.parameterId, normalizedValue);
}
