'use strict';

describe('Controller: FooterCtrl', function() {

  beforeEach(module('footer'));

  var scope = {};

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    $controller('FooterCtrl', {
      $scope: scope
    });
  }));

  // check that version is properly populated
  it('should populate the git version', function() {
    expect(scope.version).not.toBeUndefined();
    expect(scope.version).not.toBe('');
  });

});
