'use strict';

var app = angular.module('inferredValue.model', ['model', 'inference.service', 'underscore']);

app.factory('InferredValue', function(BaseModel, inferenceService) {
  var InferredValue = BaseModel.extend({
    init: function(data) {
      this._super(data);

      var value = data.inferredValue.split('|');
      this.inferredValue = value[1];
      this.parameterId = value[0];
      this.hasExceptionCode = this.inferredValue.indexOf('_EX_') > -1;
      this.displayValue = this.inferredValue;

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
      if (this.hasExceptionCode) {
        return this.targetEcode === this.extractedEcode;
      }
      return this.displayValue === this.extractedDisplayValue;
    }
  });

  return InferredValue;

});
