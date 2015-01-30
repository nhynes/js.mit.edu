function check() {
	var hasErrors = false;
	var problems = [];

	var $theDiv = $("#theDiv");
	var theDiv = document.getElementById("theDiv");

	$theDiv.attr("class","");

	if(addClass === undefined) {
		hasErrors = true;
		problems.push("addClass is undefined");
	}
	if(removeClass === undefined) {
		hasErrors = true;
		problems.push("removeClass is undefined");
	}

	if(!hasErrors) {
		addClass(theDiv, "selected");
		if(!$theDiv.is($(".selected"))) {
			hasErrors = true;
			problems.push("Failed to add class to div");
		}

		removeClass(theDiv, "selected");
		if($(".selected").length !== 0) {
			hasErrors = true;
			problems.push("Failed to remove class from div");
		}

		addClass(theDiv, "selected selected2");
		if(!$theDiv.is($(".selected.selected2"))) {
			hasErrors = true;
			problems.push("Failed to add multiple different classes to div");
		}

		removeClass(theDiv, "selected selected2");
		if($(".selected.selected2").length !== 0) {
			hasErrors = true;
			problems.push("Failed to remove multiple different classes from div");
		}

		addClass(theDiv, "selected2 selected selected2");
		if(!$theDiv.is($(".selected.selected2"))) {
			hasErrors = true;
			problems.push("Failed to add multiple same classes to div");
		}

		removeClass(theDiv, "selected2 selected2");
		if(!$theDiv.is($(".selected"))) {
			hasErrors = true;
			problems.push("Failed to remove multiple same classes from div");
		}
	}


	if(!hasErrors) {
		showCorrectAnswerDialog();
	} else {
		showIncorrectAnswerDialog(problems);
	}
}