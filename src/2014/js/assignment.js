var sections = ["Warm Up", "Practice Problem", "Challenge Problem"];

function onload() {
/*	$.cookie.json = true;
	if($.cookie('lecture1:answers') === undefined) {
		$.cookie('lecture1:answers', [[],[],[]]);
		var answers = [[],[],[]];
	} else {
		var answers = $.cookie('lecture1:answers');
	}*/

	var answers = $.cookie('lecture1:answers');
	$(".assignment").each(function(i) {
		var $questions = $(this).find("form");
		$questions.each(function(n) {
			var $this = $(this);
			$this.attr("data-questionTitle", sections[i]+" #"+(n+1));
			$this.attr("data-questionSection", i);
			$this.attr("data-numberInSection", n);

			/*if(answers[i][n] !== undefined) {
				var type = $questions.attr(type);
				switch(type) {
					case "multiple-choice":
						var selected = answers[i][n];
						$($questions.find("input[value="+selected+"]")[selected]).checked(true);
						break;
				}
			}*/
		});
	});

	$("input[value=Check]").each(function() {
		$(this).on("click", function() {
			checkQuestion($(this).parent());
		});
	});
}

function saveAnswer(sectionNumber, questionNumber, answer) {
	return;
	var answers = $.cookie('lecture1:answers');
	answers[sectionNumber][questionNumber] = answer;
	$.cookie('lecture1:answers', answers);
}

function checkQuestion($question) {
	var questionType = $question.attr("type");
	var questionTitle = $question.attr("data-questionTitle");
	var sectionNumber = $question.attr("data-questionSection");
	var questionNumber = $question.attr("data-numberInSection");

	switch(questionType) {
		case "multiple-choice":
			var expectedAnswer = expectedAnswers[sectionNumber][questionNumber];
			var $checked = $question.find("input[name=option]").filter(':checked');
			var userAnswer = $checked.val();

			$question.find(".radio-group").css("borderColor", "black");
			$question.find("input[name=option]").next().css("color", "black");

			if(userAnswer === expectedAnswer) {
				$question.find(".radio-group").css("borderColor", "green");
				$checked.next().css("fontWeight","bold");
				$checked.next().css("color","green");
			} else {
				console.log(questionTitle + " is incorrect :(");
			}
			saveAnswer(sectionNumber, questionNumber, userAnswer);
			break;

		case "compare-code":
			var lookingFor = expectedAnswers[sectionNumber][questionNumber];
			var enteredText = $question.find("textarea").val();
			var isMissingExpected = false;
			for(var i=0;i<lookingFor.length;i++) {
				if(enteredText.match(lookingFor[i]) === null) {
					isMissingExpected = true;
				}
			}

			$question.find("textarea").css("color","black");
			if(isMissingExpected) {
				console.log(questionTitle + " is incorrect :(");
			} else {
				$question.find("textarea").css("color","green");
				//TODO: save question
			}
			break;


			case "run-code":
				console.log("Checking: "+questionTitle);
				var code = $question.find("textarea").val();
				$question.find("textarea").css("color", "black");

				var cases = testCases[sectionNumber][questionNumber];

				var hasTestCaseIncorrect = false;
				for(var i=0;i<cases.length;i++) {
					var testCase = cases[i];

					toEvaluate = code;

					if(testCase.pre !== undefined) {
						toEvaluate = testCase.pre(input) || code;
					}

					// toEvaluate = toEvaluate.replace(/\n/g,'');

					eval(toEvaluate);
					window[testCase.functionName] = eval(testCase.functionName);

					var testCaseResult = testCase.getResult(ret);

					var expectedResult = expectedAnswers[sectionNumber][questionNumber][i];

					if(testCaseResult !== expectedResult) {
						hasTestCaseIncorrect = true;
						console.log("Error in test "+(i+1)+" ("+testCase.desc+")"+((testCase.showExpected || testCase.showExpected  === undefined) ? ": Expected ["+expectedResult+"] but was ["+testCaseResult+"]" : ""));
					}

					if(testCase.post !== undefined) {
						toEvaluate = testCase.post();
					}
				}

				if(!hasTestCaseIncorrect) {
					$question.find("textarea").css("color", "green");
				}		
				break;


		case "multiple run-code":
			console.log("Checking: "+questionTitle);
			var $inputs = $question.find("input[type=text]");
			var inputs = [];
			$inputs.each(function() {
				inputs.push($(this).val());
				$(this).css("color", "black");
			});
			
			var hasQuestionsIncorrect = false;
			for(var i=0;i<inputs.length;i++) {
				var input = inputs[i];

				if(input === "" || input === undefined) {
					continue;
				}

				var cases = testCases[sectionNumber][questionNumber][i];
				var hasSubtestIncorrect = false;
				for(var n=0;n<cases.length;n++) {
					var testCase = cases[n];

					var toEvaluate =  input;

					if(testCase.pre !== undefined) {
						toEvaluate = testCase.pre(input);
					}
					var ret = eval(toEvaluate);

					var testCaseResult = testCase.getResult(ret);

					var expectedResult = expectedAnswers[sectionNumber][questionNumber][i][n];

					if(testCaseResult !== expectedResult) {
						hasQuestionsIncorrect = true;
						hasSubtestIncorrect = true;
						console.log("Error in subquestion "+(i+1)+", case "+(n+1)+" ("+testCase.desc+")"+((testCase.showExpected || testCase.showExpected  === undefined) ? ": Expected ["+expectedResult+"] but was ["+testCaseResult+"]" : ""));
					}

					if(testCase.post !== undefined) {
						toEvaluate = testCase.post();
					}
				}
				if(!hasSubtestIncorrect) {
					$($inputs[i]).css("color", "green");
				}
			}

			break;


		case "multiple check-answer":
			var $inputs = $question.find("input[type=text]");
			var inputs = [];
			$inputs.each(function() {
				inputs.push($(this).val());
				$(this).css("color", "black");
			});
			
			var hasQuestionsIncorrect = false;
			for(var i=0;i<inputs.length;i++) {
				var input = inputs[i];

				if(input === "" || input === undefined) {
					continue;
				}

				var result = eval(input);
				
				var expectedResult = expectedAnswers[sectionNumber][questionNumber][i];

				if(result.toString() !== expectedResult.toString()) {
					hasQuestionsIncorrect = true;
					console.log(questionTitle+", subquestion "+(i+1)+" is incorrect :(");
				} else {
					$($inputs[i]).css("fontWeight", "bold");
					$($inputs[i]).css("color", "green");
				}
			}

			break;
	}
}

var testCases = [
	//Warm up
	[
		undefined, //nothing for q1
		undefined, //nothing for q2
		[ //question 3 has some
			[ //first of the inputs
				{ //first test case
					desc: "a = true, b = true",
					pre: function(input) {
						a = true;
						b = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = true",
					pre: function(input) {
						a = false;
						b = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = true, b = false",
					pre: function(input) {
						a = true;
						b = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = false",
					pre: function(input) {
						a = false;
						b = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				}
			],

			[ //second of the inputs
				{ //first test case
					desc: "a = true, b = true",
					pre: function(input) {
						a = true;
						b = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = true",
					pre: function(input) {
						a = false;
						b = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = true, b = false",
					pre: function(input) {
						a = true;
						b = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = false",
					pre: function(input) {
						a = false;
						b = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				}
			],

			[ //third of the inputs
				{
					desc: "a = true",
					pre: function(input) {
						a = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false",
					pre: function(input) {
						a = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				}
			],

			[ //fourth of the inputs
				{ //first test case
					desc: "a = true, b = true, c = true",
					pre: function(input) {
						a = true;
						b = true;
						c = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = true, c = true",
					pre: function(input) {
						a = false;
						b = true;
						c = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = true, b = false, c = true",
					pre: function(input) {
						a = true;
						b = false;
						c = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = true, b = true, c = false",
					pre: function(input) {
						a = true;
						b = true;
						c = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = false, c = true",
					pre: function(input) {
						a = false;
						b = false;
						c = true;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = true, c = false",
					pre: function(input) {
						a = false;
						b = true;
						c = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = true, b = false, c = false",
					pre: function(input) {
						a = true;
						b = false;
						c = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = false, b = false, c = false",
					pre: function(input) {
						a = false;
						b = false;
						c = false;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
			],

			[ //fifth of the inputs
				{ //first test case
					desc: "a = 2, b = 1, c = 3",
					pre: function(input) {
						a = 2;
						b = 1;
						c = 3;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 1, b = 2, c = 0",
					pre: function(input) {
						a = 1;
						b = 2;
						c = 0;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 1, b = 2, c = 5",
					pre: function(input) {
						a = 1;
						b = 2;
						c = 5;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 6, b = 5, c = 6",
					pre: function(input) {
						a = 6;
						b = 5;
						c = 6;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 5, b = 5, c = 6",
					pre: function(input) {
						a = 5;
						b = 5;
						c = 6;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 7, b = 7, c = 7",
					pre: function(input) {
						a = 7;
						b = 7;
						c = 7;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 9, b = 8, c = 7",
					pre: function(input) {
						a = 9;
						b = 8;
						c = 7;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
				{
					desc: "a = 0, b = -1, c = 1",
					pre: function(input) {
						a = 0;
						b = -1;
						c = 1;
						return input + "result = true; else result = false;";
					},
					getResult: function(ret) {
						return ret;
					},
					post: function() {
						result = undefined;
					}
				},
			]
		],
		//nothing for q4
	],

	//Practice
	[undefined,
		[
			{
				desc: "It's a mystery!",
				functionName: "demystifyVar",
				showExpected: false,
				getResult: function() {
					return demystifyVar([11]);
				},
			}
		],
		[
			{
				desc: "zero arguments",
				functionName: "mostlyHarmless",
				pre: function() {
					window.launchTheMissiles = function() {
						boomMessage = "BOOM";
					};
					boomMessage = "";
				},
				getResult: function() {
					return mostlyHarmless();
				},
			},
			{
				desc: "one argument",
				functionName: "mostlyHarmless",
				pre: function() {
					window.launchTheMissiles = function() {
						boomMessage = "BOOM";
					};
					boomMessage = "";
				},
				getResult: function() {
					return mostlyHarmless("poke");
				},
			},
			{
				desc: "two argument",
				functionName: "mostlyHarmless",
				pre: function() {
					window.launchTheMissiles = function() {
						boomMessage = "BOOM";
					};
					boomMessage = "";
				},
				getResult: function() {
					mostlyHarmless("goodbye,","world");
					return boomMessage
				},
			},
			{
				desc: "or more arguments",
				functionName: "mostlyHarmless",
				pre: function() {
					window.launchTheMissiles = function() {
						boomMessage = "BOOM";
					};
					boomMessage = "";
				},
				getResult: function() {
					mostlyHarmless("b","o","o","m");
					return boomMessage;
				},
			},
		],
		[
			{
				desc: "[1, 2, 3]",
				getResult: function() {
					return [1,2,3].max();
				},
			},
			{
				desc: "[1]",
				getResult: function() {
					return [1].max();
				},
			},
			{
				desc: "[4, 4, 4]",
				getResult: function() {
					return [4,4,4].max();
				},
			},
			{
				desc: "[-2, -1, -3]",
				getResult: function() {
					return [-2,-1,-3].max();
				},
			},
			{
				desc: "[]",
				getResult: function() {
					return [].max();
				},
			},
		]
	],

	//Challenge
	[
		[
			{
				desc: "original array: [1, 2, 3], function(elem) { return elem*2; }",
				functionName: "map",
				getResult: function() {
					var originalArray = [1,2,3];
					var originalArrayCopy = [1,2,3];
					var theFunction = function(elem) { return elem*2; };
					var mapped = map(originalArray, theFunction);
					if(originalArray.toString() !== originalArrayCopy.toString()) {
						return "[Original array was modified]";
					} else {
						return mapped.toString();
					}
				},
			},
			{
				desc: "original array: ['apples and bananas', 'opples and banonos', 'ipples and baninis'], function(elem) { return 'I like to eat '+elem; }",
				functionName: "map",
				getResult: function() {
					var originalArray = ['apples and bananas', 'opples and banonos', 'ipples and baninis'];
					var originalArrayCopy = ['apples and bananas', 'opples and banonos', 'ipples and baninis'];
					var theFunction = function(elem) { return 'I like to eat '+elem; }
					var mapped = map(originalArray, theFunction);
					if(originalArray.toString() !== originalArrayCopy.toString()) {
						return "[Original array was modified]";
					} else {
						return mapped.toString();
					}
				},
			},
			{
				desc: "original array: [0, 4, 2], function(elem) { return 'undefined'; }",
				functionName: "map",
				getResult: function() {
					var originalArray = [0, 4, 2];
					var originalArrayCopy = [0, 4, 2];
					var theFunction = function(elem) { return 'undefined'; };
					var mapped = map(originalArray, theFunction);
					if(originalArray.toString() !== originalArrayCopy.toString()) {
						return "[Original array was modified]";
					} else {
						return mapped.toString();
					}
				},
			},
		],

		[
			{
				desc: "Create a new Person. Expect correct toString",
				functionName: "Person",
				getResult: function() {
					var person = new Person("Ben", "Bitdiddle");
					return person.toString();
				},
			},
			{
				desc: "Create two new Persons (People?), first friends the second. Expect correct toString of the first",
				functionName: "Person",
				getResult: function() {
					var person1 = new Person("Ben", "Bitdiddle");
					var person2 = new Person("Alyssa P.", "Hacker");
					person1.friend(person2);
					return person1.toString();
				},
			},
			{
				desc: "Create two new Persons, first friends the second. Expect correct toString of the second",
				functionName: "Person",
				getResult: function() {
					var person1 = new Person("Ben", "Bitdiddle");
					var person2 = new Person("Alyssa P.", "Hacker");
					person1.friend(person2);
					return person2.toString();
				},
			},
			{
				desc: "Creating two new Persons, first friends the second, second defriends the first. Expect correct toString of the first",
				functionName: "Person",
				getResult: function() {
					var person1 = new Person("Ben", "Bitdiddle");
					var person2 = new Person("Alyssa P.", "Hacker");
					person1.friend(person2);
					person2.defriend(person1);
					return person1.toString();
				},
			},
		]
	]
];

//Oh look! Answers!
var expectedAnswers = [
	//Warm up
	[
		"array",
		[/var six ?= ?6;/, /var seven ?= ?7;/],
		[ //Multiple check code
			[true, false, false, false], //first one has 4 test cases
			[true, true, true, false],
			[false, true],
			[true, false, false, true, false, true, true, true],
			[true, false, false, true, false, false, false, true]
		],
		[/while\(randomNumber ?>= ?0?\.1\)/]
	],

	//Practice
	[
		[ //multiple check answer
			"This is a String",
			"There are 2 ways to join Strings",
			["aerate", "pet", "area"],
			5,
			"iou"
		],
		["object"],
		["Nothing to see here", "Nothing to see here", "BOOM", "BOOM"],
		[3, 1, 4, -1, null]
	],

	//Challenge
	[
		["2,4,6", "I like to eat apples and bananas,I like to eat opples and banonos,I like to eat ipples and baninis","undefined,undefined,undefined"],
		["Ben Bitdiddle has 0 friends", "Ben Bitdiddle has 1 friend", "Alyssa P. Hacker has 1 friend", "Ben Bitdiddle has 0 friends"]
	]
];

//TODO: add loading and saving from cookies
