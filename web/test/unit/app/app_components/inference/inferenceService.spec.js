'use strict';

describe('Service: inference.service', function() {

  beforeEach(module('inference.service'));
  beforeEach(module('app.config.restangular'));
  beforeEach(module('uiRouterNoop'));

  var $httpBackend;
  var APP_CONFIG;
  var inferenceService;

  beforeEach(inject(function(_$httpBackend_, _APP_CONFIG_, _inferenceService_) {
    $httpBackend = _$httpBackend_;
    APP_CONFIG = _APP_CONFIG_;
    inferenceService = _inferenceService_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should check that find inferred values by parameter id and value call is sent to the server', function() {

    var data = {
      item: '2259867|SP3'
    }

    var item = '2259867%7CSP3';
    var engine = 'f01ea16f-0dd5-4aa6-a7ab-6a2bcbafc4a1';

    var inferredValues = ["2226297|D520", "2230593|40 GB", "21995|1 GB", "22248|Latitude D520 Notebook", "21748|Dell, Inc", "21750|BBY-680569076540-REFURBISHED", "225596|Dell"];
    $httpBackend.whenGET(APP_CONFIG.inferenceUrl + '/engines/' + engine + '/infer?item=' + item).respond(inferredValues);

    inferenceService.findInferencedValuesByParameterIdAndValue(data, engine).then(function(inferredValues) {
      expect(inferredValues[0]).toBe('2226297|D520');
      expect(inferredValues[2]).toBe('21995|1 GB');
      expect(inferredValues[6]).toBe('225596|Dell');
    });

    $httpBackend.flush();
  });
});
