'use strict';

var app = angular.module('category.service', ['taxonomy.commons', 'category.model', 'service']);

app.factory('categoryService', function(TaxonomyRestangular, BaseService, Category) {

  var CategoryService = BaseService.extend({

    init: function() {
      this._super(Category, TaxonomyRestangular);
    }
  });
  return new CategoryService();
});
