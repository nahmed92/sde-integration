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
      this.extractedDisplayValue = this.extractedValue;

      // Always check first for hasExceptionCode, because if exception code exits, the targetValue and targetUnit will always be undefined
      if (this.hasExceptionCode) {
        var objRef = this;
        inferenceService.findByExceptionCodeId(this.inferredValue.replace('_EX_', '')).then(function(exceptionCode) {
          objRef.displayValue = exceptionCode.name;
          objRef.targetEcode = exceptionCode.id;
        });
      } else if (this.hasUnit) {
        this.extractedDisplayValue = this.extractedValue + ' ' + this.unitValue;
        this.targetValue = this.inferredValue.substring(0, this.inferredValue.lastIndexOf(' ')); // The value upto last space is value
        this.targetUnit = this.inferredValue.substring(this.inferredValue.lastIndexOf(' ') + 1); // The remaining string after last space is unit
      } else {
        this.targetValue = this.inferredValue;
      }

      // Displaying exception code if manually extracted
      if (this.extractedEcode > 2) {
        inferenceService.findByExceptionCodeId(this.extractedEcode).then(function(exceptionCode) {
          objRef.extractedDisplayValue = exceptionCode.name;
        });
      }
    }
  });

  return InferredValue;

});
