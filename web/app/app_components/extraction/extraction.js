'use strict';

var app = angular.module('extraction.model', ['model']);

app.factory('Extraction', function(BaseModel) {

  var Extraction = BaseModel.extend({
    extraction: [],

    init: function(data) {
      this._super(data);
      // Assigning data in inference array as data adds up properties and methods inherited
      // from Restangular which have undefined properties
      this.extraction = data;
    }
  });

  Extraction.route = 'extract';

  return Extraction;

});
