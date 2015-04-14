'use strict';

describe('Service: cmsCodedValueService.service', function() {

  beforeEach(module('app'));
  beforeEach(module('uiRouterNoop'));

  var $httpBackend;
  var APP_CONFIG;
  var cmsCodedValueService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _cmsCodedValueService_) {
    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    cmsCodedValueService = _cmsCodedValueService_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
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

    cmsCodedValueService.findCodedValuesByCategoryIdAndParameterId(data).then(function(cmsCodedValues) {
      expect(cmsCodedValues.length).toBe(3);
      expect(cmsCodedValues[0].value).toBe('SDDR3');
      expect(cmsCodedValues[1].value).toBe('SDRAM');
      expect(cmsCodedValues[2].value).toBe('DDR SGRAM');
    });

    $httpBackend.flush();
  });

});
