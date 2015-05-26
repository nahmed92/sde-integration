'use strict';

var app = angular.module('extractedValue.model', ['model', 'underscore', 'app.constants']);

app.factory('ExtractedValue', function(BaseModel, _, CONST) {
  var ExtractedValue = BaseModel.extend({
    init: function(data) {
      this._super(data);

      // SDE-2021 - Parsing values to float so that we can remove the trailing .0
      if (this.isNumber && this.value) {
        this.value = '' + parseFloat(this.value.replace(',', '')); // Replacing comma with empty string to handle thousand separator comma, and appending with empty string to convert it back to a string value so that operations like string trim doesn't fail in other part of the codebase
      }
      this.displayValue = this.value;
      this.targetValue = this.value;
      // Replace [no value] tag in extracted value if it exists
      if (_.contains(this.extractedDisplayValue, CONST.NO_VALUE)) {
        this.extractedDisplayValue = this.extractedDisplayValue.replace(CONST.NO_VALUE, '');
        this.noValue = true;
      }

      if (this.hasUnit) {
        this.targetUnit = this.unit;
        this.displayValue = this.value + ' ' + this.unit;
      }
      this.inferredValue = this.displayValue; // Setting inferredValue because this field is used for comparision and setting of SDE_INTERNAL id. Fix for [SDE-1904]
    },

    isSameAsExtracted: function() {
      if (this.isRepeatable) {
        return this.alreadyExtracted();
      } else if (this.hasExceptionCode) {
        return this.targetEcode === this.extractedEcode;
      } else if (this.extractedDisplayValue && this.displayValue) {
        return this.displayValue.replace(/>\s+</g, '><') === this.extractedDisplayValue.replace(/>\s+</g, '><');
      } else {
        return this.displayValue === this.extractedDisplayValue;
      }
    },

    // Checks if inferred parameter is already extracted, in concatenated string of repeatable parameter
    alreadyExtracted: function() {
      var extractedDisplayValues = this.extractedDisplayValue.split('<hr>');
      return _.contains(extractedDisplayValues, this.displayValue);
    }
  });

  return ExtractedValue;

});
