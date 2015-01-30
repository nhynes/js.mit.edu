'use strict'


angular.module('LiveLecture')

	.controller('LectureController', ['$scope', '$http', '$cookies', '$route', '$compile', 'socket', 'apicaller', function($scope, $http, $cookies, $route, $compile, socket, apicaller) {
		$scope.loading = true;
		$scope.lostKeywords = [];
		$scope.questions = [];
		$scope.polls = [];
		$scope.letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

		var load = function () {
			var resolve = function(userType) {
				var dashboard = userType + '-dashboard';
				var el = $compile( angular.element(document.createElement(dashboard)) )( $scope );
				angular.element(document.body).append(el);

				$scope.loading = false;
			};

			var instr = $cookies.instr;
			if (instr !== undefined) {
				var lectureTag = $route.current.params.lectureTag;
				var call = lectureTag + "/load";

				apicaller.get(call, function(data) {
					var userType = 'student';
					if (data.isInstructor) {
						userType = 'instructor'
					}
					
					resolve(userType);
				}, 
				function (data) {
					console.log(data);
				});
			} else {
				resolve('student');
			}
		};

		socket.on('bigassobject', function(socket, data) {
			$scope.questions = data.questions;

			var keys = Object.keys(data.lostKeywords);
			keys.forEach(function (key) {
				var lost = {};
				lost.keyword = key;
				lost.isLost = false;
				lost.lostCount = data.lostKeywords[key];

				$scope.lostKeywords.push(lost);
			});
		});

		// GENERIC QUESTIONS SHIT

		socket.on('question', function(socket, data) {
			var question = findQuestionById(data.questionId, $scope.questions);
			if (!question) {
				data.asked = false;
				$scope.questions.push(data);
			}
		});

		socket.on('answer', function(socket, data) {
			var question = findQuestionById(data.questionId, $scope.questions);

			if (question) {
				question.answers.push(data);
			}
		});

 
		// GENERIC LOST KEYWORD SHIT

		socket.on('lost', function(socket, data) {
			// TODO: PROB A GOOD IDEA TO ADD SOME ERROR CHECKING

			if (data && data.keyword) {
				var found = findLostKeyword(data.keyword, $scope.lostKeywords);
				if (!found) {
					var newLostKeyword = {};
					newLostKeyword.keyword = data.keyword;
					newLostKeyword.isLost = false;
					newLostKeyword.lostCount = 1;

					$scope.lostKeywords.push(newLostKeyword);
				} else {
					if (data.isLost) {
						found.lostCount++;
					} else {
						found.lostCount--;
					}
				}
			}
		});

		load();
	}])

	.directive('studentDashboard', function () {
		return {
			restrict: 'E',
			templateUrl: 'lecture/student.html',
			controller: ['$scope', 'socket', 'apicaller', function ($scope, socket, apicaller) {
				$scope.lostKeyword = "";
				$scope.showNewQuestionModal = false;
				$scope.newQuestionFormBoxContent = "";
				$scope.answerQuestionFormBoxContent = "";
				$scope.openPoll = {};

				// POLL SHIT

				socket.on("poll", function(socket, data) {
					$scope.polls.push(data);

					if (!$scope.showOpenPoll && !$scope.showNewQuestionModal) {
						$scope.openPoll = data;
						$scope.showOpenPoll = true;
					}
				});

				$scope.openPollAction = function (poll) {
					$scope.openPoll = poll;
					$scope.openPoll.selectedChoiceIndex = -1;

					$scope.showOpenPoll = true;
				};

				$scope.closeOpenPoll = function () {
					$scope.openPoll = {};
					$scope.showOpenPoll = false;
				};

				$scope.respondToPoll = function () {
					var poll = $scope.openPoll;

					if (poll.selectedChoiceIndex > -1) {
						var choice = poll.choices[poll.selectedChoiceIndex];

						var emitObj = {};
						emitObj.type = "response";
						emitObj.pollId = poll.id;
						emitObj.choice = choice;

						socket.emit('message', emitObj, function () {});

						var pollPos = getPollPosition(poll.id, $scope.polls);
						$scope.polls.splice(pollPos, 1);

						$scope.showOpenPoll = false;
						$scope.openPoll = {};
					}
				};


				// QUESTIONS SHIT

				$scope.askNewQuestion = function () {
					if ($scope.newQuestionFormBoxContent != "") {
						var emitObj = {};
						emitObj.type = "question";
						emitObj.question = $scope.newQuestionFormBoxContent;
						emitObj.answers = [];

						socket.emit('message', emitObj, function(question) {
							question.asked = true;
							$scope.questions.push(question);
						});

						$scope.showNewQuestionModal = false;
						$scope.newQuestionFormBoxContent = "";
					}
				};

				$scope.answerQuestion = function () {
					if ($scope.answerQuestionFormBoxContent != "") {
						var emitObj = {};
						emitObj.type = "answer";
						emitObj.questionId = $scope.openQuestion.questionId;
						emitObj.answer = $scope.answerQuestionFormBoxContent;

						socket.emit('message', emitObj, function (answer) {
							// TODO: PROBABLY WOULD BE BETTER TO JUST ADD THE ANSWER AUTOMATICALLY AND THEN UPDATE THE 
							$scope.openQuestion.answers.push(answer);
						});

						$scope.answerQuestionFormBoxContent = "";
					}
				};

				$scope.displayQuestion = function (question) {
					$scope.openQuestion = question;
				};

				$scope.closeQuestion = function() {
					$scope.openQuestion = null;
				};


				// LOST KEYWORDS SHIT

				$scope.addLostKeyword = function () {
					var keyword = $scope.newLostKeyword;
					if (keyword) {
						var found = findLostKeyword(keyword, $scope.lostKeywords);
						var emitObj = {};
						emitObj.type = "lost";
						emitObj.keyword = keyword;
						emitObj.isLost = true;

						if (!found) {
							var newLostKeyword = {};
							newLostKeyword.keyword = keyword;
							newLostKeyword.isLost = true;
							newLostKeyword.lostCount = 1;

							$scope.lostKeywords.push(newLostKeyword);

							socket.emit('message', emitObj, function (){});
						} else if (!found.isLost) {
							$scope.updateLostKeyword(found);
						}

						$scope.newLostKeyword = "";
					}
				};

				$scope.updateLostKeyword = function (lostKeyword) {
					if (lostKeyword.isLost) {
						lostKeyword.isLost = false;
						lostKeyword.lostCount--;
					} else {
						lostKeyword.isLost = true;
						lostKeyword.lostCount++;
					}

					var emitObj = {};
					emitObj.type = "lost";
					emitObj.keyword = lostKeyword.keyword;
					emitObj.isLost = lostKeyword.isLost;

					socket.emit('message', emitObj, function(){});
				};

			}]
		}
	})

	.directive('instructorDashboard', function () {
		return {
			restrict: 'E',
			templateUrl: 'lecture/instructor.html',
			controller: ['$scope', 'socket', function ($scope, socket) {
				$scope.newPoll = {
					title: "",
					choices: []
				}

				$scope.createNewPoll = function () {
					var poll = $scope.newPoll;

					if (poll.title != "") {
						var emitObj = {};
						emitObj.type = "poll";
						emitObj.title = poll.title;
						emitObj.choices = [];

						poll.choices.forEach(function (o) {
							if (o != "") {
								emitObj.choices.push(o);
							}
						});

						if (emitObj.choices.length > 0) {
							socket.emit("message", emitObj, function(data) {
								data.responses = [];

								for (var i = 0; i < data.choices.length; i++) {
									data.responses.push(0);
								}

								$scope.polls.push(data);
							});

							$scope.showCreatePollModal = false;
							$scope.newPoll.title = "";
							$scope.newPoll.choices = [];
						}
					}
				};

				socket.on('response', function (socket, data) {
					var pollPos = getPollPosition(data.pollId, $scope.polls);
					if (pollPos > -1) {
						var poll = $scope.polls[pollPos];

						for (var i = 0; i < poll.choices.length; i++) {
							var r = poll.choices[i];

							if (r === data.choice) {
								poll.responses[i] += 1;
							}
						}
					}
				});

			}]
		}
	});


// HELPERS

// TODO: CONSOLIDATE

function findQuestionById(questionId, questions) {
	for (var i = 0; i < questions.length; i++) {
		var q = questions[i];
		if (q.questionId === questionId) {
			return q;
		}
	}

	return null;
}

function getPollPosition(pollId, polls) {
	for (var i = 0; i < polls.length; i++) {
		var p = polls[i];
		if (p.id === pollId) {
			return i;
		}
	}

	return -1;
}

function findLostKeyword(keyword, keywords) {
	for (var i = 0; i < keywords.length; i++) {
		var k = keywords[i];
		if (k.keyword === keyword) {
			return k;
		}
	}

	return null;
}
