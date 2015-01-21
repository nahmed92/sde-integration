'use strict';

describe('Service: inference.service', function() {

  beforeEach(module('inference.service'));
  beforeEach(module('app.config.restangular'));

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

});
