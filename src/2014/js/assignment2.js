var sections = ["Warm Up", "Practice Problem", "Challenge Problem"];

function onload() {
	moveChecker = setInterval(checkIfMoved, 500);
}

function checkIfMoved() {
	var $moveme = $(".move-me");
	if($moveme.css("right") === "0px") {
		$moveme.css("backgroundColor", "green");
	} else {
		$moveme.css("backgroundColor", "orange");
	}
}

/*function onload() {
	$(".assignment").each(function(i) {
		var $questions = $(this).find("form");
		$questions.each(function(n) {
			var $this = $(this);
			$this.attr("data-questionTitle", sections[i]+" #"+(n+1));
			$this.attr("data-questionSection", i);
			$this.attr("data-numberInSection", n);
		});
	});

	$("input[value=Check]").each(function() {
		$(this).on("click", function() {
			checkQuestion($(this).parent());
		});
	});
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
					$($inputs[i]).css("color", "green");
				}
			}

			break;
	}
}

var expectedAnswers = [
	//Warm up
	[
		"one",
	],

	//Practice
	[
	],

	//Challenge
	[
	]
];*/