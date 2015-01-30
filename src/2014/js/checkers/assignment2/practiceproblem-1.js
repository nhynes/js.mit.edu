function check() {
	var people = [];
	var louis = new Person("Louis","Reasoner");
	var ben = new Person("Ben","Bitdiddle");
	var alyssa = new Person("Alyssa P.","Hacker");
	people.push(ben);
	people.push(alyssa);
	people.push(louis);
	makePeopleList(people);

	var $peopleListItems = $("li");
	var expected = ["Alyssa P. Hacker", "Ben Bitdiddle", "Louis Reasoner"];
	var hasError = false;
	var foundNames = "";
	if($peopleListItems.length === 0) {
		hasError = true;
		foundNames =  "nothing";
	}
	else {
		$peopleListItems.each(function(i) {
			foundNames += this.innerHTML+", ";
			if(this.innerHTML !== expected[i]) {
				hasError = true;
			}
		});
		foundNames = foundNames.substring(0,foundNames.length-2);
	}

	if(!hasError) {
		showCorrectAnswerDialog();
	} else {
		showIncorrectAnswerDialog(["Expected: Alyssa P. Hacker, Ben Bitdiddle, Louis Reasoner, but was:", foundNames]);
	}
}

function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.friends = [];
}

Person.prototype.getFullName = function() { return this.firstName+" "+this.lastName; }

Person.prototype.friend = function(newFriend) {
 if(!this.isFriendsWith(newFriend)) {
    this.friend(newFriend);
 }
 if(!friend.isFriendsWith(this)) {
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