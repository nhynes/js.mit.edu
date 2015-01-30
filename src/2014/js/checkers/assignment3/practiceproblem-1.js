function check() {
	var problems = [];

	if($('input[type="submit"]').val() !== "Enter the Chamber of Secrets") {
		problems.push("Expected submit button to be named 'Enter the Chamber of Secrets' but was "+$('input[type="submit"]').val());
	}

	$("#name").val("Harry Potter");
	$("#house").val("Gryffindor");
	$('input[type="submit"]').click();

	if($("span").css("color").match(/rgb\(0, [0-9]+, 0\)/) === null) {
		problems.push("Expected response text to be green");
	}

	if($("span").html() !== "In exchange for your soul, you may enter the Chamber.") {
		problems.push("Expected response text to be 'In exchange for... enter the Chamber' but was "+$("span").html());
	}

	$("#name").val("ImS0l337!!!");
	$("#house").val("Hufflepuff");
	$('input[type="submit"]').click();

	if($("span").css("color").match(/rgb\([0-9]+, 0, 0\)/) === null) {
		problems.push("Expected response (on bad name) text to be red");
	}

	if($("span").html() !== "Try again, mortal.") {
		problems.push("Expected response text (on bad name) to be 'Try again, mortal.' but was "+$("span").html());
	}

	$("#name").val("Hermione Granger");
	$("#house").val("Simmons");
	$('input[type="submit"]').click();

	if($("span").css("color").match(/rgb\([0-9]+, 0, 0\)/) === null) {
		problems.push("Expected response (on bad house) text to be red");
	}

	if($("span").html() !== "Try again, mortal.") {
		problems.push("Expected response text (on bad house) to be 'Try again, mortal.' but was "+$("span").html());
	}

	$("#name").val("");
	$("#house").val("");

	if(problems.length === 0) {
		showCorrectAnswerDialog();
	} else {
		showIncorrectAnswerDialog(problems);
	}
}