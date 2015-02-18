'use strict';

describe('InferenceValue', function() {

  beforeEach(module('inferredValue.model'));
  var InferredValue;

  var parameterInfo;
  var numericParameterInfo;
  var unitParameterInfo;

  var deferredECode;

  beforeEach(inject(function(_InferredValue_, $q) {
    InferredValue = _InferredValue_;

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

  }));

  afterEach(function() {});

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


    //    var inferredValues = ["2226297|D520", "2230593|40 GB", "21995|1 GB", "22248|Latitude D520 Notebook", "21748|Dell, Inc", "21750|BBY-680569076540-REFURBISHED", "225596|Dell"];

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

  xit('should create correct object of InferredValue containing exception code', function() {

    var data = {
      inferredValue: '2230593|_EX_4'
    }
    angular.extend(data, unitParameterInfo);
    var inferredValue = new InferredValue(data);

    deferredECode.resolve({
      id: '4',
      name: 'Not Applicable'
    });

    //    expect(inferenceService.findByExceptionCodeId).toHaveBeenCalledWith('4');

    expect(inferredValue).toBeDefined();
    expect(inferredValue.hasUnit).toBe(true);
    expect(inferredValue.hasExceptionCode).toBe(true);
    expect(inferredValue.displayValue).toBe('Not Applicable');
    expect(inferredValue.targetValue).toBeUndefined();
    expect(inferredValue.targetUnit).toBeUndefined();
    expect(inferredValue.targetEcode).toBe(4);

  });

});
