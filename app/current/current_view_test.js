'use strict';

describe('myApp.current module', function() {

  beforeEach(module('myApp.view1'));

  describe('current controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var currentViewCtrl = $controller('CurrentWeatherViewCtrl');
      expect(currentViewCtrl).toBeDefined();
    }));

  });
});