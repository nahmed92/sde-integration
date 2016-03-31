'use strict';

var app = angular.module('inferredValue.model', ['model', 'inference.service', 'underscore', 'app.constants']);

app.factory('InferredValue', function(BaseModel, inferenceService, _, CONST) {
  var InferredValue = BaseModel.extend({
    init: function(data) {
      this._super(data);

      var value = data.inferredValue.split('|');

      this.parameterId = value.shift(); // Taking out the first index from the array
      this.inferredValue = value.join('|'); // Concatenating the remaining components using |
      this.hasExceptionCode = this.inferredValue.indexOf('_EX_') > -1;
      this.displayValue = this.inferredValue;
      // Replace [no value] tag in extracted value if it exists
      if (_.contains(this.extractedDisplayValue, CONST.NO_VALUE)) {
        this.extractedDisplayValue = this.extractedDisplayValue.split(CONST.NO_VALUE).join(CONST.NO_VALUE_REPLACEMENT_MARKUP);
      }

      var exceptionCode;
      // Always check first for hasExceptionCode, because if exception code exits, the targetValue and targetUnit will always be undefined
      if (this.hasExceptionCode) {
        exceptionCode = inferenceService.findByExceptionCodeId(this.inferredValue.replace('_EX_', ''));
        if (exceptionCode) {
          this.displayValue = exceptionCode.name;
          this.targetEcode = exceptionCode.id;
        }
      } else if (this.hasUnit) {
        this.targetValue = this.inferredValue.substring(0, this.inferredValue.indexOf(' ')); // The value upto first space is value
        this.targetUnit = this.inferredValue.substring(this.inferredValue.indexOf(' ') + 1); // The remaining string after first space is unit
      } else {
        this.targetValue = this.inferredValue;
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
        return this.displayValue === this.extractedDisplayValue;
      }
    },

    // Checks if inferred parameter is already extracted, in concatenated string of repeatable parameter
    alreadyExtracted: function() {
      var extractedDisplayValues = this.extractedDisplayValue.split('<hr>');
      return _.contains(extractedDisplayValues, this.displayValue);
    }
  });

  return InferredValue;

});
