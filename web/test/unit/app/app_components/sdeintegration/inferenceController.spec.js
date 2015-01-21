'use strict';

describe('Controller: InferenceContoller', function() {

  beforeEach(module('inference'));
  beforeEach(module('uiRouterNoop'));

  var $scope;
  var inferenceService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($rootScope, $controller, $q, APP_CONFIG) {
    $scope = $rootScope.$new();
    var inferenceService = {};
    $controller('InferenceController', {
      $scope: $scope,
      inferenceService: inferenceService
    });
  }));

  it('should initialize scope', function() {
    expect($scope.model).toBeDefined();
  });

});
