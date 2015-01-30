function check() {
	var $correctSelection = $(".selectMe");
	var $selected = $(".selected");
	
	console.log();
	if($correctSelection.is($selected)) {
		showCorrectAnswerDialog();
	} else {
		var tagnames = "";
		$(".selected").each(function() {
			tagnames += this.tagName.toLowerCase() + ", ";
		});
		tagnames = tagnames.substring(0,tagnames.length-2);
		showIncorrectAnswerDialog(["Expected a span, img, and strong, but was:",tagnames]);
	}
}