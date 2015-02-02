'use strict';

/* Services */

var weatherDemoServices = angular.module('weatherDemoServices', ['ngResource']);

var API_KEY = '04d9c82f467165086723d390423cd1e1';

weatherDemoServices.factory('CurrentWeatherService', ['$resource',
    function($resource) {
        //return $resource('http://api.openweathermap.org/data/2.5/weather?q=london,uk&APPID=:apiId', {method:'@method', location:'@location', id:'@id', apiId:API_KEY}, {
        return $resource('http://api.openweathermap.org/data/2.5/:method?q=:location&id=:id&APPID=:apiId', {method:'@method', location:'@location', id:'@id', apiId:API_KEY}, {
            query : {
                method : 'GET',
                params : {
                    method : 'weather'
                },
                isArray : false
            },
            queryByLocation : {
                method : 'GET',
                params : {
                    method : 'weather',
                    location : 'location'
                },
                isArray : false
            },
            queryById : {
                method : 'GET',
                params : {
                    method : 'weather',
                    id : 'id'
                },
                isArray : false
            },
            queryHistoryByLocation : {
                method : 'GET',
                params : {
                    method : 'history/city',
                    location : 'location'
                },
                isArray : false
            },
            queryHistoryById : {
                method : 'GET',
                params : {
                    method : 'history/city',
                    id : 'id'
                },
                isArray : false
            }

        });
    }]);

weatherDemoServices.factory('PlacesService', ['$resource',
    function($resource) {
        return $resource('http://api.geonames.org/citiesJSON?maxRows=20&north=37&south=27&east=64&west=86&lang=en&username=rathomas', {location:'@location', apiId:API_KEY}, {
            query : {
                method : 'GET',
                isArray : false
            }
        });
    }]);