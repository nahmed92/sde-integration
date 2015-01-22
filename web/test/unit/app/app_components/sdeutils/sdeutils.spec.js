describe('Sdeutils test', function() {

  describe('Test getDescendantProp function', function() {

    beforeEach(module('sdeutils'));
    it('should get property', inject(function(sdeutils) {
      var obj = {
        'name': 'value',
        'name2': {
          'child': 'childValue',
          'child2': [{
            'leaf': 'grandchild-0'
          }, {
            'leaf': 'grandchild-1'
          }],
          'child3': {
            'grandchild': 'ok'
          }
        }
      };

      expect(sdeutils.getDescendantProp(obj, 'name')).toEqual('value');
      expect(sdeutils.getDescendantProp(obj, 'name2.child')).toEqual('childValue');
      expect(sdeutils.getDescendantProp(obj, 'name2.child2')).toEqual([{
        'leaf': 'grandchild-0'
      }, {
        'leaf': 'grandchild-1'
      }]);
      expect(sdeutils.getDescendantProp(obj, 'name2.child2[0]')).toBeUndefined();
      expect(sdeutils.getDescendantProp(obj, 'name2.child3')).toEqual({
        'grandchild': 'ok'
      });
      expect(sdeutils.getDescendantProp(obj, 'name2.child3.grandchild')).toEqual('ok');
      expect(sdeutils.getDescendantProp(obj, 'name2.child3.grandchild.doesntExist')).toBeUndefined();
      expect(sdeutils.getDescendantProp(null, 'name2.child3.grandchild.doesntExist')).toBeUndefined();
      expect(sdeutils.getDescendantProp(obj, null)).toBe(obj);
      expect(sdeutils.getDescendantProp(obj, undefined)).toBe(obj);
      expect(sdeutils.getDescendantProp(obj, '')).toBe(obj);

    }));
  });

  describe('Test humanReadableSize function', function() {

    beforeEach(module('sdeutils'));
    it('should get humanReadableSize', inject(function(sdeutils) {
      expect(sdeutils.humanReadableSize(1)).toEqual('1 bytes');
      expect(sdeutils.humanReadableSize(0)).toEqual('0 bytes');
      expect(sdeutils.humanReadableSize(-1)).toEqual('-1 bytes');
      expect(sdeutils.humanReadableSize(undefined)).toBeNull();
      expect(sdeutils.humanReadableSize(30)).toEqual('30 bytes');
      expect(sdeutils.humanReadableSize(700)).toEqual('0.7 kB');
      expect(sdeutils.humanReadableSize(1024)).toEqual('1.0 kB');
      expect(sdeutils.humanReadableSize(1123)).toEqual('1.1 kB');
      expect(sdeutils.humanReadableSize(13191923)).toEqual('12.6 MB');
      expect(sdeutils.humanReadableSize(8442912344)).toEqual('7.9 GB');
      expect(sdeutils.humanReadableSize(38582178517317)).toEqual('35.1 TB');
    }));
  });

  describe('Test clearFilter function', function() {

    beforeEach(module('sdeutils'));
    it('should check that clearFilter method is working correctly', inject(function(sdeutils) {

      var nullFilter = null;
      sdeutils.clearFilter(null);

      var emptyFilter = {};
      sdeutils.clearFilter(emptyFilter);
      expect(emptyFilter).toEqual({});

      var noChangeFilter = {
        'name1': 'value1',
        'name2': 'value2'
      };
      sdeutils.clearFilter(noChangeFilter);
      expect(noChangeFilter).toEqual({
        'name1': 'value1',
        'name2': 'value2'
      });

      var changeFilter = {
        'name1': 'value1',
        'name2': ''
      };
      sdeutils.clearFilter(changeFilter);
      expect(changeFilter).toEqual({
        'name1': 'value1'
      });

      changeFilter = {
        'name1': 'value1',
        'name2': '',
        'name3': undefined,
        'name4': null
      };
      sdeutils.clearFilter(changeFilter);
      expect(changeFilter).toEqual({
        'name1': 'value1'
      });

      changeFilter = {
        'name1': 'value1',
        'name2': {
          'childName': 'childValue'
        },
        'name3': '',
        'name4': [{
          'a1': 'v1'
        }, {
          'a2': 'v2'
        }, {}]
      };
      sdeutils.clearFilter(changeFilter);
      expect(changeFilter).toEqual({
        'name1': 'value1',
        'name2': {
          'childName': 'childValue'
        },
        'name4': [{
          'a1': 'v1'
        }, {
          'a2': 'v2'
        }, {}]
      });

    }));
  });
});
