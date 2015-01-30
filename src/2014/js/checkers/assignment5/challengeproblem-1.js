function check() {
	var problems = [];

	window.location.hash = "benbitdiddle";
	setTimeout(function() {
		if($("h1").get(0).innerHTML !== "Ben Bitdiddle") {
			problems.push("Expected the heading to be 'Ben Bitdiddle', but was "+$("h1").html());
		}

		var links = $("a");
		if(links.length !== 2) {
			problems.push("Expected two friend links for Ben, but he has "+links.length);
		}

		var foundZark = false;
		links.each(function() {
			if(this.innerHTML === "Zark Muckerberg") {
				foundZark = true;
			}
		});
		if(!foundZark) {
			problems.push("Expected Zark Muckerberg to be listed as friends with Ben");
		}


		window.location.hash = "zarkmuckerberg";
		setTimeout(function() {
			if($("h1").get(0).innerHTML !== "Zark Muckerberg") {
				problems.push("Expected the heading to be 'Zark Muckerberg', but was "+$("h1").html());
			}

			var links = $("a");
			if(links.length !== 3) {
				problems.push("Expected three friend links for Zark, but he has "+links.length);
			}

			window.location.hash = "";

			if(problems.length === 0) {
				setTimeout(function() {
					showCorrectAnswerDialog();
				}, 500);
			} else {
				setTimeout(function() {
					showIncorrectAnswerDialog(problems);
				}, 500);
			}
		}, 500);
	}, 500);
}