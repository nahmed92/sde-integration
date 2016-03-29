'use strict';

var app = angular.module('extractedValue.model', ['model', 'underscore', 'app.constants']);

app.factory('ExtractedValue', function(BaseModel, _, CONST) {
  var ExtractedValue = BaseModel.extend({
    init: function(data) {
      this._super(data);

      // SDE-2021 - Parsing values to float so that we can remove the trailing .0
      // Replacing comma with empty string to handle thousand separator comma, and appending with empty string to convert it back to a string value so that operations like string trim doesn't fail in other part of the codebase
      this.targetValue = this.isNumber ? ('' + parseFloat(this.value.replace(',', ''))) : this.value;
      this.displayValue = this.isNumber ? ('' + parseFloat(this.value.replace(',', ''))) : this.value;

      if (this.hasUnit) {
        // this.targetValue = angular.isDefined(this.unit) ? this.value : this.value.substring(0, this.value.indexOf(' ')); // The value upto first space is value [SDE-2311]
        this.targetUnit = angular.isDefined(this.unit) ? this.unit : this.value.substring(this.value.indexOf(' ') + 1); // The remaining string after first space is unit [SDE-2311]
        this.displayValue = this.targetValue + ' ' + this.targetUnit;
      }

      this.inferredValue = this.displayValue; // Setting inferredValue because this field is used for comparison and setting of SDE_INTERNAL id. Fix for [SDE-1904]

      // Replace [no value] tag in extracted value if it exists
      if (_.contains(this.extractedDisplayValue, CONST.NO_VALUE)) {
        this.extractedDisplayValue = this.extractedDisplayValue.replace(CONST.NO_VALUE, '');
        this.noValue = true;
      }

    },

    isSameAsExtracted: function() {
      if (this.isRepeatable) {
        return this.alreadyExtracted();
      } else if (this.hasExceptionCode) {
        return this.targetEcode === this.extractedEcode;
      } else if (this.extractedDisplayValue && this.displayValue) {
        return this.displayValue.replace(/>\s+</g, '><') === this.extractedDisplayValue.replace(/>\s+</g, '><');
      } else {
        // This case happens when display value or extracted display value is null, and we want to avoid .replace() method on a null value
        return this.displayValue === this.extractedDisplayValue;
      }
    },

    // After standard value is retrieved from taxonomy service, this method will be called to update the fields dependent on value
    // No updating display value with unit because this case is only valid for coded values, which can never have units
    updateValue: function(newValue) {
      this.value = newValue;
      this.displayValue = newValue;
      this.targetValue = newValue;

      this.inferredValue = this.displayValue; // Setting inferredValue because this field is used for comparison and setting of SDE_INTERNAL id. Fix for [SDE-1904]
    },

    // After standard value for unit is retrieved from taxonomy service, this method is called to update the fields dependent on unit
    updateUnit: function(newUnit) {
      this.displayValue = this.value;
      this.targetUnit = newUnit;
      this.displayValue = this.value + ' ' + newUnit;

      this.inferredValue = this.displayValue; // Setting inferredValue because this field is used for comparison and setting of SDE_INTERNAL id. Fix for [SDE-1904]
    },

    // Checks if inferred parameter is already extracted, in concatenated string of repeatable parameter
    alreadyExtracted: function() {
      var extractedDisplayValues = this.extractedDisplayValue.split('<hr>');
      return _.contains(extractedDisplayValues, this.displayValue);
    }
  });

  return ExtractedValue;

});
