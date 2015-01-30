var express		= require("express")
var cookie		= require("express/node_modules/cookie");
var parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie;
var app			= express();
var server		= require("http").createServer(app);
var io			= require("socket.io").listen(server);
var redis		= require("redis");
var mongoose	= require("mongoose");
var exec		= require("child_process").exec;
var uuid		= require("node-uuid");
var Lecture		= require("./lecture.schema");

//MongoDB
mongoose.connect('mongodb://localhost/lectures');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

//Redis
var rcon = redis.createClient();
var rsub = redis.createClient();

rsub.subscribe("__keyevent@0__:expired");
rsub.on("message", function(channel, message) {
	if(channel === "__keyevent@0__:expired") {
		var expiredLectureTag = message.split(':')[1];
		io.sockets.in(expiredLectureTag).emit('end-lecture',{});
		//Signals to clients that they should disconnect
	}
});


//Express config (middleware)
var SECRET = '0xdeadbeef';
app.configure(function () {
	app.use(express.compress());
	app.use(express.cookieParser(SECRET));
	app.use(express.urlencoded());
	app.use(app.router);
	app.use(express.logger('dev'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.static(__dirname + '/static'));
});

//Socket.io config
io.configure(function() {
	io.set('log level', 1);

	io.set('authorization', function(handshakeData, callback) {
		var referer = handshakeData.headers.referer;
		if(referer === undefined) {
			callback(null, false);
			return;
		}
		var lectureTag = referer.match(/\/[a-z]+\/?$/);
		if(lectureTag === null) {
			callback(null, false);
			return;
		}
		lectureTag = lectureTag[0].replace(/\//g,'');

		//Make sure the lecture exists and is in session
		rcon.hget('lecture:'+lectureTag, 'id', function(error, lectureId) {
			if(error) {
				callback(error, false);
				return;
			}
			if(lectureId) {
				var cookies = handshakeData.headers.cookie;
				var isInstructor = false;
				if(cookies) {
					var instr = parseSignedCookie(cookie.parse(cookies)['instr'], SECRET);
					if(requesterIsInstructor(instr, lectureId)) {
						isInstructor = true;
					}
				}
				handshakeData.lectureInfo = {
					lectureId: lectureId,
					lectureTag: lectureTag,
					isInstructor: isInstructor
				};
				callback(undefined, true);
			} else {
				callback(undefined, false);
			}
			
		});
	});
});


app.get("/api/:action", function(req, res) {
	var action = req.params.action;

	switch(action) {
		case "newlecture":
			var getTag = "dd if=tags.txt skip=$(expr $(date +%N) " +
				"\\% $(stat -c \"%s\" tags.txt)) ibs=1 count=200 " +
				"2>/dev/null | sed -n '2{p;q;}'";
			//todo: make this keep trying words until it gets
			//      one that works (try exec-sync)
			exec(getTag, function(error, stdout, stderr) {
				if(error !== null) {
					res.status(500)
					.send({lectureTag: "fuck", error: error});
				}

				//The params
				var lectureTag = stdout.trim();
				var lectureId = generateId(8);

				//Passed in by the user-agent
				var instrPassword = req.query.instrPassword;
				var lectureLength = (req.query.lectureLength * 60) || 180; //minutes

			//	lectureTag = "apple";

				var newLecture = new Lecture({
					id: lectureId,
				});

				newLecture.save(function(error) {
					if(error) {
						console.log("fuck mongodb:",error);
					}
				});

				var lectureInfo = {
					id: lectureId,
					instrPassword: instrPassword,
				};

				//TODO: Make sure that the value wasn't already defined...
				rcon.hmset('lecture:'+lectureTag, lectureInfo, function(error) {
					if(error) {
						console.log("ERROR: failed to save lecture info into redis");
					}
					rcon.expire('lecture:'+lectureTag, lectureLength*60 /*min->seconds*/);
				});

				setInstructorCookie(lectureId, req, res);

				res.send({lectureTag: lectureTag});
			});
			break;

		default:
			res.status(400).end();
			break;
	}
});

app.get("/api/:lectureTag/:action", checkIfLectureExists, function(req, res) {
	var lectureTag = req.params.lectureTag;
	var lectureId = req.params.lectureId;
	var action = req.params.action;

	switch(action) {
		case "load":
			res.send({isInstructor:  requesterIsInstructor(req.signedCookies.instr, lectureId)});
			break;

		case "instructify":
			//possibly add check to see if user is already instr
			if(requesterIsInstructor(req.signedCookies.instr, lectureId)) {
				res.status(400).end();
				return;
			}

			var userEnteredPassword = req.query.instrPassword;
			rcon.hget('lecture:'+lectureTag, 'instrPassword', function(error, instrPassword) {
				if(error) {
					console.log(error);
					res.status(500).end();
					return;
				}
				if(instrPassword && instrPassword === userEnteredPassword) {
					setInstructorCookie(lectureId, req, res);
					res.status(200).end(); //signal to client to refresh the page
				} else {
					res.status(403).end();
				}
			});
			break;

		default:
			res.status(400).end();
			break;
	}
});

app.post("/api/:lectureTag/:action", checkIfLectureExists, function(req, res) {
	var lectureTag = req.params.lectureTag;
	var lectureId = req.params.lectureId;
	var action = req.params.action;

	switch(action) {
		case "end":
			if(!requesterIsInstructor(req.signedCookies.instr, lectureId)) {
				res.writeHead(403);
				res.end();
				return;
			}
			io.sockets.in(lectureTag).emit('end-lecture',{});
			rcon.del('lecture:'+lectureTag, function(error) {
				if(error) {
					console.log("ERROR: failed to clear lecture info from redis");
					res.status(500).end();
					return;
				}
				res.send();
			});
			break;

		default:
			res.status(400).end();
			break;
	}
});

// SERVE STATIC FILES...
// TODO: KINDA HACKY, FIGURE OUT PROPER WAY
app.get("/*.*", function(req, res) {
	res.sendfile("static" + req.url);
});

// SERVE VIEWS, ANGULAR PARSES URL
app.get("/:lectureTag", checkIfLectureExists, function(req, res) {
	res.sendfile("static/index.html");
});

app.get("/*", function(req, res) {
	res.sendfile("static/index.html");
});

io.sockets.on('connection', function(socket) {
	var lectureInfo = socket.handshake.lectureInfo;
	var lectureTag = lectureInfo.lectureTag;

	var lectureQuery = Lecture.findOne({'id': lectureInfo.lectureId});

	// socket.set('lectureInfo', lectureInfo);


	//BEGIN PUSH BIGASSOBJECT
	rcon.hget('lecture:'+lectureTag, 'lostKeywords', function(error, lostKeywords) {
		if(error) {
			console.log("error reading data from redis:",error);
			res.status(500).end();
			return;
		}
		//console.log("249",lostKeywords);
		if(lostKeywords === null) {
			lostKeywords = {};
			var sortedKeywordsList = [];
		} else {
			lostKeywords = JSON.parse(lostKeywords);
			var sortedKeywordsList = Object.keys(lostKeywords).sort(function(a, b) {return -(lostKeywords[a] - lostKeywords[b])});
		}

		lectureQuery.select('questions');
		lectureQuery.exec(function(err, lecture) {
			if(err) {
				console.log("ERROR GETTING POLLS FROM DB", err);
				return;
			}
			var questions = lecture.questions;

			var bigAssObject = {
				sortedKeywordsList: sortedKeywordsList,
				lostKeywords: lostKeywords,
				questions: questions
			};

			socket.emit('bigassobject', bigAssObject);
		});
	});

	//END PUSH BIGASSOBJET


	socket.join(lectureTag);

	if(lectureInfo.isInstructor) {
		socket.join(lectureTag+'-instr');

		socket.on('message', function(data, callback) {
			data.timestamp = Date.now();
			//Just send the data to everyone in the lecture
			if(data.type === "poll") {
				data.id = generateId(4);
				data.timestamp = Date.now();

				lectureQuery.select('polls');
				lectureQuery.exec(function(err, lecture) {
					if(err) {
						console.log("ERROR GETTING POLLS FROM DB", err);
						return;
					}
					console.log(lecture);
					lecture.polls.push(data);
					lecture.save(function(err) {
						if(err) {
							console.log("ERROR SAVING POLL TO DB", err);
							return;
						}
						console.log("saved poll");
					});
				});
			}
			socket.broadcast.to(lectureTag).emit("poll", data);
			callback(data);
		});
	} else {
		socket.join(lectureTag+'-student');

		socket.on('message', function(data, callback) {

			console.log(data);

			switch(data.type) {
				case "lost":
					//TODO: verify that student is lost or unlost

					lectureQuery.select('lost');
					lectureQuery.exec(function(err, lecture) {
						if(err) {
							console.log("ERROR GETTING LOST FROM DB", err);
							return;
						}
						console.log(lecture);
						lecture.lost.push(data);
						lecture.save(function(err) {
							if(err) {
								console.log("ERROR SAVING LOST TO DB", err);
								return;
							}
							console.log("saved lost");
						});
					});

					var lostKeyword = {
						isLost: data.isLost, //true if should be added, false if removed
						keyword: data.keyword
					};
					socket.broadcast.to(lectureTag+"-student").emit('lost', lostKeyword);

					// data.studentId = studentId; //devious
					io.sockets.in(lectureTag+"-instr").emit('lost', data);

					rcon.hget('lecture:'+lectureTag, 'lostKeywords', function(error, lostKeywords) {
						if(error) {
							console.log("error reading data from redis:",error);
							res.status(500).end();
							return;
						}
						if(lostKeywords === null) {
							lostKeywords = {};
						} else {
							lostKeywords = JSON.parse(lostKeywords);
						}
						console.log(lostKeywords[data.keyword]);
						if(data.isLost) {
							lostKeywords[data.keyword] = (lostKeywords[data.keyword] === undefined ? 1 : ++lostKeywords[data.keyword]);
						} else {
							lostKeywords[data.keyword] = (lostKeywords[data.keyword] === undefined ? 0 : --lostKeywords[data.keyword]);
						}
						
						rcon.hset('lecture:'+lectureTag, 'lostKeywords', JSON.stringify(lostKeywords), function(error) {
							if(error) {
								console.log("ERROR: failed to save lost keywords into redis", error);
							}
						});
					});
					break;

				case "response":

					console.log("GOT");

					lectureQuery.select('polls');
					lectureQuery.exec(function(err, lecture) {
						if(err) {
							console.log("ERROR GETTING POLLS FROM DB", err);
							return;
						}
						var pollIndex = findItemById(lecture.polls, data.pollId);
						if(pollIndex === -1) {
							return;
						}
						lecture.polls[pollIndex].responses.push(data);
						lecture.markModified('polls');
						lecture.save(function(err) {
							if(err) {
								console.log("ERROR SAVING RESPONSE TO DB", err);
								return;
							}
						});
					});

					//send poll responses to instr
					io.sockets.in(lectureTag+"-instr").emit('response', data);
					// data.studentId = studentId;
					break;

				case "question":
					data.questionId = generateId(4);
					data.id = data.questionId;

					lectureQuery.select('questions');
					lectureQuery.exec(function(err, lecture) {
						if(err) {
							console.log("ERROR GETTING QUESTIONS FROM DB", err);
							return;
						}
						console.log(lecture);
						lecture.questions.push(data);
						lecture.save(function(err) {
							if(err) {
								console.log("ERROR SAVING QUESTIONS TO DB", err);
								return;
							}
							console.log("saved question");
						});
					});
					socket.broadcast.to(lectureTag).emit(data.type, data);
					callback(data);
					break;

				case "answer":
					data.id = generateId(4);

					lectureQuery.select('questions');
					lectureQuery.exec(function(err, lecture) {
						if(err) {
							console.log("ERROR GETTING QUESTION FROM DB", err);
							return;
						}
						var questionIndex = findItemById(lecture.questions, data.questionId);
						if(questionIndex === -1) {
							return;
						}
						lecture.questions[questionIndex].answers.push(data);
						lecture.markModified('questions');
						lecture.save(function(err) {
							if(err) {
								console.log("ERROR SAVING ANSWER TO DB", err);
								return;
							}
						});
					});

					socket.broadcast.to(lectureTag).emit(data.type, data);
					callback(data)
					break;

				default:
					//send everything else to everyone
					socket.broadcast.to(lectureTag).emit(data);
					break;
			}
		});
	}

	socket.on('disconnect', function() {
		
	});
});

//Start listening on port 4242
server.listen(4242, "0.0.0.0");


//Helper functions. will export later

/**
 * Determines if the requester is an instructor for this
 * lecture.
 *
 * @param instrOf the instructor cookie
 * @param lectureId the lecture's ID
 *
 * @return true if the requester is an instructor,
 *         false, otherwise
 */
function requesterIsInstructor(instrOf, lectureId) {
	if(instrOf === undefined || instrOf.indexOf(lectureId) === -1) {
		return false;
	}
	return true;
}

/**
 * Intermediate callback for HTTP requests that determines whether
 * the requested lectureTag is associated with a lecture(ID).
 * If not found, will send a 404 response
 * If error, will send a 500 response
 * Otherwise, control will be passed to the next callback with the
 * lectureId property of the request.params object set to the lecture ID
 *
 * Note: assumes that lectureTag is a parameter of the request
 *
 * @param req the HTTP request object
 * @param res the HTTP response object
 */
function checkIfLectureExists(req, res, next) {
	var lectureTag = req.params.lectureTag;

	rcon.hget('lecture:'+lectureTag, 'id', function(error, lectureId) {
		if(error) {
			console.log("error reading data from redis:",lectureTag,action);
			res.status(500).end();
		} else if(!lectureId) {
			res.redirect("/");
		} else {
			req.params.lectureId = lectureId;
			next();
		}
	});
}

/**
 * Sets the lecture instructor cookie for the user-agent
 *
 * @param lectureId the lecture for which to grant instructor perms
 * @param req the HTTP request object
 * @param res the HTTP response object
 */
function setInstructorCookie(lectureId, req, res) {
	if(req.signedCookies.instr === undefined) {
		res.cookie('instr', [lectureId], {signed: true, expires: new Date(2279248962042)});
	} else {
		var instrOf = req.signedCookies.instr;
		instrOf.push(lectureId);
		res.cookie('instr', instrOf, {signed: true, expires: new Date(2279248962042)});
	}
}

/**
 * Generates a random ID string with a specified length
 *
 * @param length the length of the ID
 *
 * @return the ID
 */
function generateId(length) {
	var symbols = "abcdefghijklmnopqrstuvwxyz0123456789";
	var id = "";
	for(var i=0;i<length;i++) {
		var index = Math.floor(Math.random()*symbols.length);
		id += symbols[index];
	}
	return id;
}

//Ugly, shouldn't have to do. should switch to SQL. fuck it all.
function findItemById(questions, id) {
	for(var i=0;i<questions.length;i++) {
		if(questions[i].id === id) {
			return i;
		}
	}
	return -1;
}
