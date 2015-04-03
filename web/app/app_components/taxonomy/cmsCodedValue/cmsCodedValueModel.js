'use strict';

var app = angular.module('cmsCodedValue.model', ['model']);

app.factory('CmsCodedValue', function(BaseModel) {

  var CmsCodedValue = BaseModel.extend({
    init: function(data) {
      this._super(data);
    }

  });

  CmsCodedValue.route = 'cmsCodedValues';

  return CmsCodedValue;
});
