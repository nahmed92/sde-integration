'use strict';

describe('Service: extraction.service', function() {

  beforeEach(module('extraction.service'));
  beforeEach(module('app.config.restangular'));
  beforeEach(module('uiRouterNoop'));

  var $httpBackend;
  var APP_CONFIG;
  var extractionService;

  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _extractionService_) {
    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    extractionService = _extractionService_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should check that find inferred values by parameter id and value call is sent to the server', function() {

    var data = {
      productId: 12345,
      text: 'Testing text',
      categoryId: 111,
      parameterIds: [1, 2, 3, 4, 5]
    }

    var extractedValues = [{
      parameterId: 2230522,
      value: 'i5-4200U'
    }, {
      parameterId: 21995,
      value: '1',
      unit: 'GB'
    }, {
      parameterId: 2229779,
      value: '2.8',
      unit: 'GHz'
    }];
    $httpBackend.whenPOST(APP_CONFIG.baseUrl + '/extract', data).respond(extractedValues);

    extractionService.extractForSourceValue(data).then(function(extractions) {
      expect(extractions[0].parameterId).toEqual(2230522);
      expect(extractions[0].value).toMatch('i5-4200');
      expect(extractions[0].unit).toBeUndefined();

      expect(extractions[2].parameterId).toEqual(2229779);
      expect(extractions[2].value).toMatch('2.8');
      expect(extractions[2].unit).toBe('GHz');
    });

    $httpBackend.flush();
  });
});
