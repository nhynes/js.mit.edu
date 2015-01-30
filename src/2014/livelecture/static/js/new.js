'use strict';


angular.module('LiveLecture')

.controller('NewLectureController', ['$scope', '$http', '$location', 'apicaller', function($scope, $http, $location, apicaller) {
	$scope.showNewForm = false;
	$scope.password = "";
	$scope.lectureLength = 3;
	$scope.newLectureTag = "";
	$scope.baseURL = $location.absUrl();

	$scope.createNewLecture = function () {
		if ($scope.password != "" && !isNaN($scope.lectureLength)) {
			var call = "newlecture?instrPassword=" + $scope.password + "&lectureLength=" + $scope.lectureLength;

			apicaller.get(call, function(data) {
				console.log(data);

				$scope.newLectureTag = data.lectureTag;

				$scope.showNewForm = false;
				$scope.showNewResult = true;
			}, 
			function (data) {
				console.log(data);
			});
		}
	};

	$scope.goToLecture = function () {
		if ($scope.newLectureTag != "") {
			$location.path('/' + $scope.newLectureTag);
		}
	};

}]);