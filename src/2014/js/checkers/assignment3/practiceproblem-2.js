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

function getPeople() {
	var personList = [];
	var louis = new Person("Louis","Reasoner"); //friends with ben and zark
	var ben = new Person("Ben","Bitdiddle"); //friends with louis, ben, and alyssa
	var alyssa = new Person("Alyssa P.","Hacker"); //friends with zark
	var zarkMuckerberg = new Person("Zark", "Muckerberg"); //friends with louis, ben, and alyssa
	louis.friend(ben);
	ben.friend(zarkMuckerberg);
	zarkMuckerberg.friend(louis);
	alyssa.friend(zarkMuckerberg);
	personList.push(louis);
	personList.push(ben);
	personList.push(alyssa);
	personList.push(zarkMuckerberg);

	return personList;
}

function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.friends = [];
}

Person.prototype.getFullName = function() { return this.firstName+" "+this.lastName; }

Person.prototype.friend = function(newFriend) {
 if(!this.isFriendsWith(newFriend)) {
    this.friends.push(newFriend);
 }
 if(!newFriend.isFriendsWith(this)) {
    newFriend.friend(this)
 }
}

Person.prototype.defriend = function(noLongerFriend) {
 if(this.isFriendsWith(noLongerFriend)) {
    this.defriend(noLongerFriend);
 }
 if(noLongerFriend.isFriendsWith(this)) {
    noLongerFriend.friend(this)
 }
}

Person.prototype.isFriendsWith = function(person) { 
   return this.friends.indexOf(person) !== -1;
}

Person.prototype.toString = function() {
    return this.getFullName() + " has " + this.friends.length + " friends";
}