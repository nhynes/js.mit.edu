'use strict';


// Declare app level module which depends on filters, and services
angular.module('LiveLecture', ['ngRoute', 'ngCookies']).

config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/:lectureTag', {
			templateUrl: 'lecture/base.html',
			controller: 'LectureController'
		})
		.when('/', {
			templateUrl: 'new.html',
			controller: 'NewLectureController'
		})
		.otherwise({
			redirectTo:'/'
		});

	$locationProvider.html5Mode(true);
}]);