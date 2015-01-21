'use strict';

var app = angular.module('service', ['restangular', 'Class']);

app.factory('BaseService', function($q, Class) {

  var BaseService = Class.extend({
    init: function(Model, Restangular) {
      this.Model = Model;
      this.Restangular = Restangular;
      this.route = Model.route;
      Restangular.extendModel(Model.route, function(model) {
        return new Model(model);
      });
    },

    future: function(fn) {
      var deferred = $q.defer();
      fn.then(function(data) {
        deferred.resolve(data);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    findOne: function(selfLink) {
      return this.future(this.Restangular.oneUrl(this.route, selfLink).get());
    },

    findAll: function(data) {
      return this.future(this.Restangular.all(this.route).getList(data));
    },

    remove: function(data) {
      this.Restangular.restangularizeElement(data.parentResource, data, this.route);
      return this.future(data.remove());
    },

    save: function(data) {
      var call = null;
      if (data.isNew()) {
        call = this.Restangular.all(this.route).post(
          data);
      } else {
        this.Restangular.restangularizeElement(data.parentResource, data, this.route);
        call = data.put();
      }

      return this.future(call);
    }

  });

  return BaseService;
});
