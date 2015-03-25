'use strict';

var app = angular.module('category.model', ['model', 'underscore', 'app.config']);

app.factory('Category', function(BaseModel, APP_CONFIG, _) {

  var Category = BaseModel.extend({
    init: function(data) {
      this._super(data);
      this.findAllParameters = _.once(this._findAllParameters);
      this.getId = _.once(this._getId);
    },

    _getId: function() {
      /* jshint ignore:start */
      var template = new UriTemplate(APP_CONFIG.taxonomyUrl + '/categories/{id}');
      return template.fromUri(this._links.self.href).id;
      /* jshint ignore:end */
    },

    _findAllParameters: function() {
      var parameterList = [];
      var headers = this.headers;
      angular.forEach(Object.keys(headers), function(headerId) {
        angular.forEach(headers[headerId].attributes, function(attribute) {
          angular.forEach(attribute.parameters, function(parameter) {
            parameterList.push(parameter);
          });
        });
      });
      return parameterList;
    },

    findHeaderById: function(id) {
      return this.headers[id];
    },

    findParamaterById: function(id) {
      // type checking
      if (angular.isString(id)) {
        id = parseInt(id, '10');
      }
      var allParamaters = this.findAllParameters();
      var parameter = _.find(allParamaters, function(parameter) {
        return parameter.cmsId === id;
      });

      if (angular.isDefined(parameter)) {
        return parameter;
      }
      throw 'Parameter with cmsId:' + id + ' not found.';
    }
  });

  Category.route = 'categories';

  return Category;
});
