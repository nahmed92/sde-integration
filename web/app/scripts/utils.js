'use strict';

angular.module('sdeutils', ['angular-growl'])
  .service('sdeutils', function(growl) {

    // This method can be used to get inner properties of any object. Angular JS only allows 1st level childen to be accessed using the obj['childProp'] notation
    // Warning, this does not work on arrays
    this.getDescendantProp = function(obj, desc) {
      if (desc === null || desc === undefined || desc.length === 0) {
        return obj;
      }
      var arr = desc.split('.');
      while (arr.length) {
        if (obj === null || obj === undefined) {
          return undefined;
        }
        obj = obj[arr.shift()];
      }
      return obj;
    };

    // This method will pretty print file sizes (1.7 kB instead of 1742 bytes)
    this.humanReadableSize = function(fileSizeInBytes) {
      if (fileSizeInBytes === null || fileSizeInBytes === undefined) {
        // FIXME: Should this be null or undefined?
        return null;
      }

      if (fileSizeInBytes < 103) {
        return fileSizeInBytes + ' bytes';
      }

      var i = -1;
      var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
      do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
      } while (fileSizeInBytes > 1024);
      return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];

    };

    // This method will remove any keys from the given object which have null, undefined or empty values
    // We require for filters to work properly on columns which have blank values
    this.clearFilter = function(filter) {
      if (filter) {
        angular.forEach(filter, function(value, key) {
          if (value === '' || value === undefined || typeof(value) === undefined || value === null) {
            delete filter[key];
          }
        });
      }
    };

    this.errorHandler = function(error, defaultMsg, ttl) {
      var options = {};
      if (ttl && angular.isNumber(ttl) && ttl > 0) {
        options.ttl = ttl;
      }

      var message;
      if (error && error.status) {
        message = error.statusText + '. ';
        message += (error.data && error.data.message) ? error.data.message : defaultMsg;
      } else if (defaultMsg && defaultMsg.length > 0) {
        message = defaultMsg;
      } else {
        // Fall back case, if the error object is invalid and the default message is also not given, we display a generic error, with a TTL of 4000 millisecond
        message = 'An error has occured';
        options.ttl = 4000;
      }
      growl.error(message, options);
    };
  }).filter('propsFilter', function() {
    // Adds filter functionality to angular select
    return function(items, props) {
      var out = [];
      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }
      return out;
    };
  }).filter('formatPositiveNumber', function() {
    return function(number) {
      if (number > 0) {
        return '+' + number;
      }
      return number;
    };
  });
