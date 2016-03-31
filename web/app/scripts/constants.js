'use strict';

angular.module('app.constants', []).constant('CONST', {
  // define the constants
  // When a unit is extracted but the value is empty in edit specs, such as when only one unit is in the list and is selected by default,
  // Edit specs sets the string [no value] in extractedDisplayValue field, so that we can replace it here and show it as a formatted label (See JIRA SDE-1856)
  NO_VALUE: '[no value]',
  NO_VALUE_REPLACEMENT_MARKUP: '<span class="label label-warning">No Value</span>'
});
