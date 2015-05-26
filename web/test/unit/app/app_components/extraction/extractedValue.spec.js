'use strict';

describe('ExtractedValue', function() {

  beforeEach(module('extractedValue.model'));
  var ExtractedValue;

  var parameterInfo;
  var numericParameterInfo;
  var unitParameterInfo;

  var deferredECode;

  beforeEach(inject(function(_ExtractedValue_, $q) {
    ExtractedValue = _ExtractedValue_;

    parameterInfo = {
      element: {},
      parameterId: 2230522,
      parameterName: 'Processor Model',
      hasUnit: false,
      isNumber: false,
      isCoded: true,
      isRepeatable: false,
      extractedValue: '',
      extractedDisplayValue: '',
      extractedEcode: undefined
    };

    unitParameterInfo = {
      element: {},
      parameterId: 2239228,
      parameterName: 'Maximum Turbo Speed',
      hasUnit: true,
      isNumber: true,
      isCoded: false,
      isRepeatable: false,
      unitValue: 'GHz',
      extractedValue: '',
      extractedDisplayValue: '[no value] GHz',
      extractedEcode: undefined
    };

  }));

  afterEach(function() {});

  it('should create an ExtractedValue object', function() {

    var data = {
      parameterId: 2230522,
      value: 'i5-1234'
    }
    angular.extend(data, parameterInfo);
    var extractedValue = new ExtractedValue(data);

    expect(extractedValue).toBeDefined();
    expect(extractedValue.targetValue).toMatch('i5-1234');
    expect(extractedValue.hasUnit).toBe(false);
    expect(extractedValue.displayValue).toMatch('i5-1234');
    expect(extractedValue.targetUnit).toBeUndefined();
    expect(extractedValue.targetEcode).toBeUndefined();

  });

  it('should create correct object of ExtractedValue containing units', function() {

    var data = {
      parameterId: 2239228,
      value: '12',
      unit: 'V AC'
    }
    angular.extend(data, unitParameterInfo);
    var extractedValue = new ExtractedValue(data);

    expect(extractedValue).toBeDefined();
    expect(extractedValue.hasUnit).toBe(true);
    expect(extractedValue.displayValue).toMatch('12 V AC');
    expect(extractedValue.targetValue).toMatch('12');
    expect(extractedValue.targetUnit).toMatch('V AC');
    expect(extractedValue.targetEcode).toBeUndefined();

  });

  it('should remove trailing decimal point and zero from ExtractedValue containing numeric value', function() {

    // This case covers SDE-2021
    // In numeric values, the trailing .0 should be removed, and the type of value should still be string, to allow string trim function and avoid any unforeseen issues in existing codebase

    var data = {
      parameterId: 2239228,
      value: '12.0',
      unit: 'V AC'
    }
    angular.extend(data, unitParameterInfo);
    var extractedValue = new ExtractedValue(data);

    expect(extractedValue).toBeDefined();
    expect(extractedValue.isNumber).toBe(true);
    expect(extractedValue.targetValue).toMatch('12');
    expect(extractedValue.displayValue).toMatch('12 V AC');
    expect(extractedValue.value).toMatch('12'); // value is an internal field, and should not be used beyond the constructor of extactedValue class

  });

  it('should replace [no value] string while creating ExtractedValue object', function() {

    var data = {
      parameterId: 2239228,
      value: '3.8',
      unit: 'GHz'
    }
    angular.extend(data, unitParameterInfo);
    var extractedValue = new ExtractedValue(data);

    expect(extractedValue.displayValue).toMatch('3.8 GHz');
    expect(extractedValue.extractedDisplayValue).toMatch('GHz');
    expect(extractedValue.noValue).toBe(true);

  });

});
