'use strict';

describe('Service: cmsUnitService.service', function() {

  beforeEach(module('app'));
  beforeEach(module('uiRouterNoop'));

  var $httpBackend;
  var APP_CONFIG;
  var cmsUnitService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _cmsUnitService_) {
    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    cmsUnitService = _cmsUnitService_;
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

    cmsUnitService.findUnitValuesByCategoryIdAndParameterId(data).then(function(cmsUnits) {
      expect(cmsUnits.length).toBe(3);
      expect(cmsUnits[0].name).toBe('MHZ');
      expect(cmsUnits[1].name).toBe('GHZ');
      expect(cmsUnits[2].name).toBe('GB');
    });

    $httpBackend.flush();
  });

});
