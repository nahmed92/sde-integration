'use strict';

/*jshint unused:false*/
function showInferenceOverlay(elem) {
  var jqElement = angular.element(elem);
  var paramId = jqElement.attr('parameter-id');
  var selectedValue = jqElement.val();

  var scope = angular.element('#inference-container').scope();
  scope.parameterName = jqElement.attr('parameter-name');
  scope.selectedValue = selectedValue;

  // If class ppu is associated with the element it means the parameter has
  // a unit group attached. We'll get the element's preceding sibling's value
  // first and then concatenate it with selected value
  if (jqElement.hasClass('ppu')) {
    selectedValue = parseFloat(jqElement.prev().val()) + ' ' + selectedValue;
    scope.selectedValue = selectedValue;
  } else if (jqElement.hasClass('ppn')) {
    selectedValue = parseFloat(selectedValue);
  }

  scope.findValues(paramId, selectedValue);
}
