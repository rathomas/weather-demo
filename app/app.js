'use strict';

// Declare app level module which depends on views, and components
angular.module('weatherDemoApp', [
    'ngRoute',
    'ngResource',
    'current',
    'version',
    'weatherDemoServices'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/current'});
}]);
