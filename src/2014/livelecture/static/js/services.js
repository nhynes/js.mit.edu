'use strict';

angular.module('LiveLecture')

	.factory('apicaller', ['$http', function ($http) {
		var singleton = {};

		var caller = function (method, call, data, successCallback, errorCallback) {
			$http({
				method: method,
				url: "api/" +  call,
				data: data,
			})
				.success(function (data, status, headers, config) {
					successCallback(data);
				})
				.error(function(data, status, headers, config) {
					errorCallback(data);
				});
		};

		singleton.get = function (call, successCallback, errorCallback) {
			caller('GET', call, null, successCallback, errorCallback);
		};

		singleton.post = function (call, data, successCallback, errorCallback) {
			caller('POST', data, successCallback, errorCallback);
		};

		return singleton;
	}])

	.factory('socket', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
		var singleton = {};
		var socket = io.connect();

		singleton.on = function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$timeout(function () {
					var data = args[0];
					callback(socket, data);
				}, 0);
			});
		};

		singleton.emit = function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;

				$rootScope.$apply(function () {
					if (callback) {
						var data = args[0];
						callback(data);
					}
				});
			});
		};

		return singleton;
	}]);