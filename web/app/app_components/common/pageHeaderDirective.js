'use strict';

angular.module('page-header', []).directive('etPageHeader', function() {

  return {
    restrict: 'E',
    scope: {
      title: '=',
      subtitle: '='
    },
    templateUrl: '/app_components/common/pageHeader.tpl.html'
  };

});
