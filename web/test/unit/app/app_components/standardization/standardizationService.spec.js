'use strict';

describe('Service: standardizationService', function() {

  beforeEach(module('standardization.service'));
  beforeEach(module('app.config.restangular'));

  var $httpBackend;
  var APP_CONFIG;
  var PARAMETER_ID;
  var standardizationService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _standardizationService_) {

    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    PARAMETER_ID = '12345';
    standardizationService = _standardizationService_;

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  //  addVariations
  it('should add variations', function() {
    $httpBackend.when('PUT', APP_CONFIG.standardizationUrl + '/standards/' + PARAMETER_ID, {
      'key': 'value'
    }).respond(204, null);

    standardizationService.addVariations(PARAMETER_ID, {
      'key': 'value'
    }).then(function(data, x) {
      // Do nothing, since a successful addition will return a 204 code with empty body
    }, function() {
      throw 'Should not come in else block';
    });

    $httpBackend.flush();
  });

});
