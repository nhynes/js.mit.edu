function check() {
	if(HTMLCheckerRan) {
		showCorrectAnswerDialog();
	} else {
		showIncorrectAnswerDialog(["Try including the HTML checker instead of this file directly."]);
	}
}
