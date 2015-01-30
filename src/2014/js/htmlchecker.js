if(document.body === null) {
	console.log("ERROR: HTML checker script does not belong in the <head> section of the page. Put it in the <body>.");
}

if($.expando === undefined) {
	console.log("ERROR: jQuery has either not been included or was included after this function was called");
} else {
	var pageTitle = $("title").html();
	var match = pageTitle.match(/Assignment ([2-7]) - (Warm|Practice|Challenge) (up|problem) #([1-9])/);
	if(match === null) {
		console.log("ERROR: nonconforming page title. Format: Assignment N - Warm up, Practice problem, or Challenge Problem #N");
	} else {
		assignmentNumber = match[1];
		sectionTitle = (match[2]+match[3]).toLowerCase();
		problemNumber = match[4];

		var $checker = $("<script>");
		$checker.attr("type", "text/javascript");
		$checker.attr("src", "http://introjsiap.com/js/checkers/assignment"+assignmentNumber+"/"+sectionTitle+"-"+problemNumber+".js");

		$checker.appendTo(document.body);

		var $styles = $("<link>");
		$styles.attr("rel", "stylesheet");
		$styles.attr("type", "text/css");
		$styles.attr("href", "http://introjsiap.com/resources/htmlchecker.css");
		$styles.appendTo(document.head);
	}
}

HTMLCheckerRan = true;

function showModalDialog(title, $contents, maxWidth, maxHeight) {
	var $body = $(document.body);
	var $modalDialogBackground = $("<div />").addClass("modal-dialog-background");
	$modalDialogBackground.on("click", hideModalDialog);
	$modalDialogBackground.appendTo($body);
	$(document.body).css("overflow","hidden");

	var $modalDialog = $("<div />").addClass("modal-dialog");

	var $closeButton = $("<div />").addClass("close-button").html("x");
	$closeButton.on("click", hideModalDialog);
	$closeButton.appendTo($modalDialog);

	var $dialogTitle = $("<h1 />").addClass("heading").html(title);
	$dialogTitle.appendTo($modalDialog);

	$contents.appendTo($modalDialog);

	if(maxWidth !== undefined && maxWidth !== 0) {
		$modalDialog.css("maxWidth", maxWidth);
	}
	if(maxHeight !== undefined && maxHeight !== 0) {
		$modalDialog.css("maxHeight", maxHeight);
	}

	$modalDialog.appendTo($body);
	var dialogRect = $modalDialog[0].getBoundingClientRect();
	$modalDialog.css("top", Math.max(0, $(window).height()/2.3 - dialogRect.height/2 + $(window).scrollTop() ));
	$modalDialog.css("left", $(window).width()/2 - dialogRect.width/2);
}

function hideModalDialog() {
	$(".modal-dialog").remove();
	$(".modal-dialog-background").remove();
	$(document.body).css("overflow", "auto");
}

function showCorrectAnswerDialog() {
	var title = "<span style='color:green;font-weight:bold;font-size:1.5em;'>&#x2713;</span> You got it!";
	var $contentsContainer = $("<div>").css("text-align","center");
	var $contents = $("<img>").attr("src","http://www.clipartpal.com/_thumbs/pd/education/nice_job_green_2.png").css("margin","auto");
	$contents.appendTo($contentsContainer);
	showModalDialog(title, $contentsContainer);
}

function showIncorrectAnswerDialog(reasons) {
	var title = "<span style='color:red;font-weight:bold;font-size:1.5em;transform:rotate(90deg);'>:(</span> Not quite.";
	var $reasons = $("<ul>");
	for(var i=0;i<reasons.length;i++) {
		var $reason = $("<li>");
		$reason.html(reasons[i]);
		$reason.appendTo($reasons);
	}
	showModalDialog(title, $reasons);
}