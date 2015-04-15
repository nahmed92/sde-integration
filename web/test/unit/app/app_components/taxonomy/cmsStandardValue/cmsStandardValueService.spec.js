'use strict';

describe('Service: cmsStandardValue.service', function() {

  beforeEach(module('underscore'));
  beforeEach(module('cmsStandardValue.service'));
  beforeEach(module('app.config.restangular'));

  var $httpBackend;
  var APP_CONFIG;
  var cmsStandardValueService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _cmsStandardValueService_) {

    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    cmsStandardValueService = _cmsStandardValueService_;

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should check that finding unit values by category and parameter id call is sent to the server', function() {

    var data = {
      'categoryId': 4782,
      'parameterId': 22007
    };

    var units = {
      "_embedded": {
        "cmsUnits": [{
          "name": "MHZ",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsUnits/101098546"
            }
          }
        }, {
          "name": "GHZ",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsUnits/51"
            }
          }
        }, {
          "name": "GB",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsUnits/3769"
            }
          }
        }]
      }
    };

    $httpBackend.whenGET(APP_CONFIG.taxonomyUrl + '/cmsUnits/search/findByCategoryIdAndParameterId?categoryId=4782&parameterId=22007').respond(units);

    cmsStandardValueService.findStandardValuesByCategoryIdParameterIdAndDataType(4782, 22007, 'NUMBER').then(function(cmsUnits) {
      expect(cmsUnits.length).toBe(3);
      expect(cmsUnits[0].value).toBe('MHZ');
      expect(cmsUnits[1].value).toBe('GHZ');
      expect(cmsUnits[2].value).toBe('GB');
    });

    $httpBackend.flush();
  });

  it('should check that finding coded values by category and parameter id call is sent to the server', function() {

    var data = {
      'categoryId': 4782,
      'parameterId': 22007
    };

    var codedValues = {
      "_embedded": {
        "cmsCodedValues": [{
          "value": "SDDR3",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsCodedValues/101098546"
            }
          }
        }, {
          "value": "SDRAM",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsCodedValues/51"
            }
          }
        }, {
          "value": "DDR SGRAM",
          "active": true,
          "_links": {
            "self": {
              "href": APP_CONFIG.taxonomyUrl + "/cmsCodedValues/3769"
            }
          }
        }]
      }
    };

    $httpBackend.whenGET(APP_CONFIG.taxonomyUrl + '/cmsCodedValues/search/findByCategoryIdAndParameterId?categoryId=4782&parameterId=22007').respond(codedValues);

    cmsStandardValueService.findStandardValuesByCategoryIdParameterIdAndDataType(4782, 22007, 'CODED').then(function(cmsCodedValues) {
      expect(cmsCodedValues.length).toBe(3);
      expect(cmsCodedValues[0].value).toBe('SDDR3');
      expect(cmsCodedValues[1].value).toBe('SDRAM');
      expect(cmsCodedValues[2].value).toBe('DDR SGRAM');
    });

    $httpBackend.flush();
  });
});
