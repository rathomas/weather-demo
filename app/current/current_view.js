'use strict';

angular.module('current', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/current', {
    templateUrl: 'current/current_view.html',
    controller: 'CurrentWeatherViewCtrl'
  });
}])

.filter('kelvinToFahrenheit', function(){
        return function kelvinToFahrenheit(tempInKelvin){
            return Math.round(((tempInKelvin - 273.15)*9/5)+32);
        };
    }
)

.controller('CurrentWeatherViewCtrl', ['$scope', 'CurrentWeatherService', 'PlacesService',
    function($scope, CurrentWeatherService, PlacesService) {
        $scope.cities = [];

        $scope.selectedLocations = [];
        $scope.compareLocations = [];

        $scope.addCitiesDisabled = true;
        $scope.addCitiesDisabledMsg = "";

        var maxLocations = 4;

        function init () {
            console.log("CurrentWeatherService running: ");

            disableAddCities();

            //load cities
            PlacesService.query(function(response) {
                $scope.cities = response.geonames
                enableAddCities();
            });

            //add default locations
            $scope.addViewLocation("New York, NY");
            $scope.addViewLocation("London, UK");
        }

        $scope.addViewLocation = function (viewLocation) {

            disableAddCities();

            if(locationSelectionsAvailable()){

                //lookup a location
                CurrentWeatherService.queryByLocation({
                    location : viewLocation
                }, function(response) {

                    //if location id already exists
                    if(! _.find($scope.selectedLocations, {'id': response.id})){
                        $scope.selectedLocations.push(response);

                        //slots available for add
                        locationSelectionsAvailable() ? enableAddCities() : disableAddCities;
                    }
                    else{
                        enableAddCities();
                    }
                });
            }
        };

        $scope.removeViewLocation = function (locationId) {

            removeCompareLocation(locationId);

            //remove by id
            _.remove($scope.selectedLocations, function (n) {
                return n.id === locationId;
            });
            enableAddCities();
        };

        $scope.compareLocation = function (locationId) {

            //lookup location by id
            var location = getLocationById(locationId);

            //lookup location by id
            var locationIndex = getLocationIndexById(locationId);

            //call details
            if($scope.compareLocations.indexOf(locationId) < 0){
                $scope.compareLocations.push(locationId);

                //lookup history data
                CurrentWeatherService.queryHistoryById({id:locationId}, function(response) {
                    location.history = response.list;
                    $scope.selectedLocations[locationIndex] = location;

                    if($scope.compareLocations.length > 0){
                        removeD3Chart();
                    }
                    updateD3Chart();
                });
            }
            else{
                removeCompareLocation(locationId);
            }
        };

        function removeCompareLocation(locationId){
            _.remove($scope.compareLocations, function(n){
                return n === locationId;
            })

            removeD3Chart();
            if($scope.compareLocations.length > 0){
                updateD3Chart();
            }
        }

        function enableAddCities(){
            $scope.addCitiesDisabled = false;
            $scope.addCitiesDisabledMsg = "Loading ...";
        }

        function disableAddCities(){
            $scope.addCitiesDisabledMsg = locationSelectionsAvailableNext() ? "Loading ..." : "Max allowed is " + maxLocations +" ...";
            $scope.addCitiesDisabled = true;
        }

        function locationSelectionsAvailable(){
            return _.size($scope.selectedLocations) < maxLocations;
        }

        function locationSelectionsAvailableNext(){
            return _.size($scope.selectedLocations) < maxLocations-1;
        }

        function getLocationById(locationId) {
            return _.find($scope.selectedLocations, {id:locationId});
        }
        function getLocationIndexById(locationId) {
            return _.findIndex($scope.selectedLocations, {id:locationId});
        }

        //add or update D3 chart panel data
        function updateD3Chart() {

            var datasets = [];
            var datasetsLabel = [];
            var dataset;

            var index, len;
            var location;

            var colorsLow = ['lightgreen', 'pink', 'lightblue', 'white'];
            var colorsHigh = ['green', 'red', 'blue', 'purple'];

            //static mock data
            //    var dataset = [1, 31, 42, 35, 23, 55, 32, 44, 36];

            for (index = 0, len = $scope.compareLocations.length; index < len; ++index) {

                //get location object
                location = getLocationById($scope.compareLocations[index]);

                //map the temprature sets into an array
                datasets.push(_.map(location.history, function (n) {
                        return kelvinToFahrenheit(n.main.temp);
                    })
                );

                datasetsLabel.push(_.map(location.history, function (n) {
                        return n.dt;
                    })
                );

            }

            var margin = {top:10,right:10,bottom:20,left:40}

            var totalWidth = 835;
            var totalHeight = 300;

            for (index = 0, len = datasets.length; index < len; ++index) {

                dataset = datasets[index];

                var w = 835 - margin.left - margin.right;
                var h = totalHeight/len - margin.top - margin.bottom;

                var svg = d3.select('#chartArea')
                    .append('svg')
                    .attr('width', w + margin.left + margin.right)
                    .attr('height', h + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

                var xScale = d3.scale.ordinal()
                    .domain(dataset)
                    .rangeBands([0, w], 0.1, 0)

                var allData = _.flatten(datasets);
                var yScale = d3.scale.linear()
                    .domain([d3.min(allData),d3.max(allData)])
                    .range([h,0]);

                var colorScale = d3.scale.linear()
                    .domain([d3.min(allData), d3.max(allData) ])
                    .range([colorsHigh[index], colorsLow[index]]);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .ticks(20/len)
                    .innerTickSize(1)
                    .outerTickSize(2)
                    .tickPadding(5);

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(8)
                    .innerTickSize(1)
                    .outerTickSize(2)
                    .tickPadding(5);

                svg.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis);

                if(index === len-1){
                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + (totalHeight) + ')')
                        .call(xAxis);
                }

                svg.selectAll('rect')
                    .data(dataset)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', function (d, i) {
                        return xScale(d);
                    })
                    .attr('y', function (d) {
                        return h-yScale(d);
                    })
                    .attr('width', xScale.rangeBand())
                    .attr('height', function (d) {
                        return yScale(d);
                    })
                    .attr('fill', colorScale)
                    .on('mouseover', function(d){
                        d3.select(this).classed('overState', true)
                    })
                    .on('mouseout', function(d){
                        d3.select(this).classed('overState', false)
                    });
            }
        };

        function removeD3Chart(){
            d3.selectAll('g')
                .remove();
            d3.selectAll('svg')
                .remove();
        }

        function kelvinToFahrenheit(tempInKelvin){
            return Math.round(((tempInKelvin - 273.15)*9/5)+32);
        };

        init();

    }]);
