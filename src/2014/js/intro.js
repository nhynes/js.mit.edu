function onload() {
	$(".main-heading.tilted").on("click", swingHeading);

	var $nextClassInfo = $("#nextClassInfo");
	$nextClassInfo.on("click", showSchedule);

	$(window).on("resize", resize);
	$(window).on("scroll", scroll);

	var nextClass = getNextClass();
	$nextClassInfo.html(nextClass.date+(nextClass.room !== undefined ? " in "+nextClass.room : ""));

	$("#easter-egg").on("click", function() {
		alert("Come on, the class hasn't even started yet!\nYour patience will be rewarded soon enough.");
	});
}

function getNextClass() {
	var IAP = 2014;

	for(var i = 0; i < classInfo.length; i++) {
		var theClass = classInfo[i];
		var now = new Date();
		var classDateStr = theClass.date.split(' ')[1].split('/');
		var classDate = new Date(IAP, classDateStr[0]-1, classDateStr[1], 15);
		console.log(classDate);
		if(classDate > now) {
			return theClass;
		}
	}
	return {date:"IAP "+(IAP+1)+"!"};
}


function resize() {
	moveHeading();
	var $modalDialog = $(".modal-dialog");
	if($modalDialog.length > 0) {
		var dialogRect = $modalDialog[0].getBoundingClientRect();
		$modalDialog.css("top", Math.max(0, $(window).height()/2.3 - dialogRect.height/2));
		$modalDialog.css("left", $(window).width()/2 - dialogRect.width/2);
	}
}

function scroll() {
	moveHeading();
}

var currentHeadingHeight = $(window).height();
function moveHeading() {
	if(headingHasDropped) {
		var newScreenBottom = $(window).height()+$(document).scrollTop()-10;
		var $heading = $(".main-heading.tilted");
		if(currentHeadingHeight < newScreenBottom) {
			currentHeadingHeight = newScreenBottom;
			var fallTime = .4;
			$heading.css("transition", "all " + fallTime + "s cubic-bezier(.56, .09, .93, .85)");
			moveToPoint($heading[0], "current", newScreenBottom);
		} else if(currentHeadingHeight > newScreenBottom) {
			currentHeadingHeight = newScreenBottom;
			$heading.css("transition", "all .1s cubic-bezier(.56, .09, .93, .85)");
			moveToPoint($heading[0], "current", newScreenBottom);
		}
	}
}

function showSchedule() {
	//courseInfo comes from the angular definitions. do not 
	var $schedule = $("<div />").addClass("schedule");
	var $classes = $("<table />").addClass("class-list");
	$classes.on("mouseout", function(e) {
		$(".maps").css("backgroundPosition", "0px 0px");
	});
	var currentClass = getNextClass();
	for(var i = 0; i < classInfo.length; i++) {
		$class = $("<tr />").addClass("item");
		$class.on("mouseover", function() {
			var $map = $(".maps");
			if($($(this).children()[3]).html().split('-').indexOf("4") !== -1) {
				$map.css("backgroundPosition", "300px 0px");
			} else {
				$map.css("backgroundPosition", "600px 0px");
			}
		});
		if(classInfo[i] === currentClass) {
			$class.css("font-weight", "bold");
		}
		$day = $("<td />").addClass("date").html(classInfo[i].date.split(' ')[0]);
		$date = $("<td />").addClass("date").html(classInfo[i].date.split(' ')[1]);
		$time = $("<td />").addClass("time").html(classInfo[i].time);
		$room = $("<td />").addClass("room").html(classInfo[i].room);
		$day.appendTo($class);
		$date.appendTo($class);
		$time.appendTo($class);
		$room.appendTo($class);
		$class.appendTo($classes);
	}
	$classes.appendTo($schedule);
	var $maps = $("<div />").addClass("maps");
	$maps.css("backgroundImage", "url(resources/maps.jpg)");
	$maps.appendTo($schedule);
	showModalDialog("Class Schedule IAP 2014", $schedule);
}

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
	$(".close-button").off("click", hideModalDialog);
	$(".modal-dialog-background").off("click", hideModalDialog);
	var $dialog = $(".modal-dialog")
	var delay = enableGravity($dialog[0]);
	setTimeout(function() {
		$dialog.css("transition", "transform .4s ease-in");

		//Hack to get browser to repaint component before re-enabling transitions
		var currentDisplay = $component.css("display");
		$component.css("display", "none");
		$component.css("display", currentDisplay);

		rotateToAngle($dialog[0], (Math.random() > .5 ? Math.PI : -Math.PI-.00001));
		setTimeout(function() {
			moveToPoint($dialog[0], "current", $(window).height()+$(document).scrollTop()+$dialog[0].getBoundingClientRect().height);
			setTimeout(function() {
				$(".modal-dialog").remove();
				$(".modal-dialog-background").remove();
				$(document.body).css("overflow", "auto");
			}, 300);
		}, 350);
	}, delay+100);
}

function swingHeading() {
	$this = $(this);
	$this.off("click", swingHeading);
	var animation = swingComponent(this, .25);
	$this.attr("data-animationId", animation);
	$this.css("cursor", "default");
	setTimeout(dropHeading, Math.random()*5500+600);
};

var headingHasDropped = false;
function dropHeading() {
	$heading = $(".main-heading.tilted");
	stopAnimation($heading.attr("data-animationId"));
	// $heading.attr("data-animationId", undefined);
	var time = enableGravity($heading[0]);
	setTimeout(function() { headingHasDropped = true; }, time+100);
};

function displayAdditionalResources(link) {
	var lectureNumber = $(link).attr("data-classNumber");

	var $additionalResources = $("<div />");
	for(var i = 0; i < additionalResources[lectureNumber].length; i++) {
		var $additionalResource = $(additionalResources[lectureNumber][i]).addClass("additional-resource-link");
		$additionalResource.appendTo($additionalResources);
		$("<br />").appendTo($additionalResources);
	}

	showModalDialog("Additional Resources", $additionalResources);
}
