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

var people = [];
var louis = new Person("Louis","Reasoner"); //friends with ben and zark
var ben = new Person("Ben","Bitdiddle"); //friends with louis, ben, and alyssa
var alyssa = new Person("Alyssa P.","Hacker"); //friends with zark
var zarkMuckerberg = new Person("Zark", "Muckerberg"); //friends with louis, ben, and alyssa
louis.friend(ben);
ben.friend(zarkMuckerberg);
zarkMuckerberg.friend(louis);
alyssa.friend(zarkMuckerberg);
people.push(louis);
people.push(ben);
people.push(alyssa);
people.push(zarkMuckerberg);

module.exports = people;