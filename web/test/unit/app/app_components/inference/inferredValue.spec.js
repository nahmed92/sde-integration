'use strict';

describe('InferenceValue', function() {

  beforeEach(module('inferredValue.model'));
  beforeEach(module('app.constants'));
  var InferredValue;
  var CONST;

  var parameterInfo;
  var numericParameterInfo;
  var unitParameterInfo;
  var noValueParameterInfo;

  var deferredECode;

  beforeEach(inject(function(_InferredValue_, $q, _CONST_) {
    InferredValue = _InferredValue_;
    CONST = _CONST_;

    parameterInfo = {
      parameterId: 2226297,
      parameterName: 'Product Model',
      hasUnit: false,
      isNumber: false,
      extractedValue: 'D430',
      extractedUnit: undefined,
      extractedEcode: undefined
    };

    numericParameterInfo = {
      parameterId: 12345,
      parameterName: 'Number of USB Ports',
      hasUnit: false,
      isNumber: true,
      extractedValue: undefined,
      extractedUnit: undefined,
      extractedEcode: undefined
    };

    unitParameterInfo = {
      parameterId: 21995,
      parameterName: 'Memory',
      hasUnit: true,
      isNumber: true,
      extractedValue: 4,
      extractedUnit: 'GB',
      extractedEcode: undefined
    };

    noValueParameterInfo = {
      parameterId: 2239228,
      parameterName: 'Maximum Turbo Speed',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: false,
      unitValue: 'GHz',
      extractedValue: '',
      extractedDisplayValue: '[no value] GHz<hr>[no value] GHz<hr>[no value] GHz',
      extractedEcode: undefined
    };

  }));

  it('should create an InferredValue object', function() {

    var data = {
      inferredValue: '2226297|SP3'
    }
    angular.extend(data, parameterInfo);
    var inferredValue = new InferredValue(data);

    expect(inferredValue).toBeDefined();
    expect(inferredValue.targetValue).toBe('SP3');
    expect(inferredValue.hasUnit).toBe(false);
    expect(inferredValue.displayValue).toBe('SP3');
    expect(inferredValue.targetUnit).toBeUndefined();
    expect(inferredValue.targetEcode).toBeUndefined();
  });

  it('should create correct object of InferredValue containing units', function() {

    var data = {
      inferredValue: '2230593|40 GB'
    }
    angular.extend(data, unitParameterInfo);
    var inferredValue = new InferredValue(data);

    expect(inferredValue).toBeDefined();
    expect(inferredValue.hasUnit).toBe(true);
    expect(inferredValue.hasExceptionCode).toBe(false);
    expect(inferredValue.displayValue).toBe('40 GB');
    expect(inferredValue.targetValue).toBe('40');
    expect(inferredValue.targetUnit).toBe('GB');
    expect(inferredValue.targetEcode).toBeUndefined();
  });

  it('should replace all occurrences of [no value] string while creating InferredValue object', function() {

    var data = {
      inferredValue: '2239228|3.8 GHz'
    }
    angular.extend(data, noValueParameterInfo);
    var inferredValue = new InferredValue(data);

    expect(inferredValue.displayValue).toEqual('3.8 GHz');
    expect(inferredValue.extractedDisplayValue).toNotContain(CONST.NO_VALUE);
    expect(inferredValue.extractedDisplayValue).toContain(CONST.NO_VALUE_REPLACEMENT_MARKUP);
    expect(inferredValue.extractedDisplayValue).toEqual(CONST.NO_VALUE_REPLACEMENT_MARKUP + ' GHz<hr>' + CONST.NO_VALUE_REPLACEMENT_MARKUP + ' GHz<hr>' + CONST.NO_VALUE_REPLACEMENT_MARKUP + ' GHz');
    expect(inferredValue.noValue).toBe(undefined);
  });

});
