'use strict';

var app = angular.module('cmsUnit.model', ['model']);

app.factory('CmsUnit', function(BaseModel) {

  var CmsUnit = BaseModel.extend({
    init: function(data) {
      this._super(data);
    }

  });

  CmsUnit.route = 'cmsUnits';

  return CmsUnit;
});
