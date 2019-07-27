var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var logout = require('express-passport-logout');
var BasicStrategy = require('passport-http').BasicStrategy;

//var app = express();
//var jsonParser = bodyParser.json();

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sharedSession = require('express-socket.io-session');

var User = require('./models/user');
var Chat = require('./models/chat');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'no one saw this',
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

io.use(sharedSession(session, {
    autoSave:true
}));

app.get('/', function(request, response) {
    response.send("Hello World!");
});

//start mongdb with: mongod --dbpath /users/ryancarter/projects/mongo_data

//connect to database and run http server
var runServer = function(callback) {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }
        //server.listen but need to make sure server var is available
        server.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
}

//create new users
app.post('/api/registration', function(req, res) {
	console.log(req.body);
	/*res.send(req.body);*/

	//validate user regstration entries
	if(!req.body) {
		return res.status(400).json({
			message: "No request body"
		});
	}

	if(!('username' in req.body)) {
		return res.status(422).json({
			message: "Missing field: username"
		});
	}

	var username = req.body.username;

	if(typeof username !== 'string') {
		return res.status(422).json({
			message: "incorrect field type: username"
		});
	}

	username = username.trim();

	if(username === '') {
		return res.status(422).json({
			message: "Incorrect field length: username"
		});
	}

	//ENSURE EMAIL CONTAINS @ SYMBOL
	/*if(!('@' in email)) {
		return res.status(422).json({
			message: "Missing character: email"
		});
	}*/

	if(!('email' in req.body)) {
		return res.status(422).json({
			message: "Missing field: email"
		});
	}

	var email = req.body.email;

	if(typeof email !== 'string') {
		return res.status(422).json({
			message: "incorrect field type: email"
		});
	}

	email = email.trim();

	if(email === '') {
		return res.status(422).json({
			message: "Incorrect field length: email"
		});
	}

	if(!('password' in req.body)) {
		return res.status(422).json({
			message: "Missing field: password"
		});
	}

	var password = req.body.password;

	if(typeof password !== 'string') {
		return res.status(422).json({
			message: "Incorrect field type: password"
		});
	}

	password = password.trim();

	if(password === '') {
		return res.status(422).json({
			message: "Incorrect field length: password"
		});
	}

	//use bcrypt to hash passwords before saving to db
	bcrypt.genSalt(10, function(err, salt) {
		if(err) {
			return res.status(500).json({
				message: "Internal server error"
			});
		}

		bcrypt.hash(password, salt, function(err, hash) {
			if(err) {
				return res.status(500).json({
					message: "Internal server error"
				});
			}

			var user = new User({
				username: username,
				email: email,
				password: hash
			});

			//save new user registration info to db
			user.save(function(err) {
				if(err) {
					return res.status(500).json({
					message: "Internal server error"
				});
			}
				return res.status(201).json({});
			});
		});
	});
});

//REMOVE LATER
//get route to check registration info being saved to db
app.get('/api/regInfo', function(req, res) {
	User.find({}, 'username email password', function(err, data) {
		if (err) {
            throw err;
        } else {
            console.log(data);
            res.send(data);
        }
    });
});

//temporary code to delete everything in chat db while testing
/*User.remove(function(err, p) {
    if(err){ 
        throw err;
    } else {
    console.log('Number of documents deleted:' + p);
    }
});*/

//passport authentication strategy to sign in users
var strategy = new BasicStrategy(function(email, password, callback) {
	User.findOne({
		email: email
	}, function(err, user) {
		if(err) {
			callback(err);
			return;
		}
		if(!user) {
			return callback(null, false, {
				message: "Incorrect email"
			});
		}
		user.validatePassword(password, function(err, isValid) {
			if(err) {
				return callback(err);
			}
			if(!isValid) {
				return callback(null, false, {
					message: "incorrect password"
				});
			}
			return callback(null, user);
		});
	});
});

passport.use(strategy);

//LOCAL STRATEGY - NEED TO WRITE THE STRATEGY ABOVE
//get route for local authentication
/*app.get('/api/authentication', passport.authenticate('local'), function(req, res) {
	console.log(req.user);
	console.log(req.user.username);
	var session = req.session;
	session.username = req.user.username;
	res.send({redirect: '/user.html', user: req.user.username});
});*/

//get route for basic authentication
app.get('/api/authentication', passport.authenticate('basic', {session: false}), function(req, res) {
	var session = req.session;
	session.username = req.user.username;
	session.userid = req.user._id;
	res.send({redirect: '/user.html', user: req.user.username, userId: req.user._id});
	console.log(req.user);
	console.log(req.user.username);
	console.log(req.user._id);
});

//get route for user logout
app.get('/api/logOut', function(req, res) {
	req.logout();
	var session = req.session;
	req.session.destroy(function(err) {
		if (err) {
			return next(err);
		}
		return res.send({redirect: '/', success: true, session: session});
	});
	console.log(session);
	console.log('log out please');
});

/*app.get('/api/logOut', function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			return next(err);
		}
		var session = req.session;
		res.send({redirect: '/', session: session});
		console.log(session);
	});
	console.log('log out please');
});*/

/*app.get('/api/logOut', function(req, res) {
	req.logout();
	var session = req.session;
	req.session.destroy(function() {
		res.clearCookie('cookie', {path: '/'});
		res.send({redirect: '/', session: session});
	});
	console.log('log out please');
});*/

//destroy session when user lands on login page
/*app.get('/api/destroySession', function(req, res) {
	req.logout();
	var session = req.session;
	req.session = null
	req.session.destroy(function() {
		res.clearCookie('connect.sid', {path: '/'});
		res.send({session: session})
	});
});*/

//send logged in user info to logged in front end
app.get('/api/globalUserAttributes', function(req, res) {
	var session = req.session;
	console.log(session);
	res.send(session);
});

//send user list when requested
app.get('/api/getUserList', function(req, res) {
	User.find({}, 'username', function(err, data) {
		if (err) {
            throw err;
        } else {
            console.log(data);
            res.send(data);
        }
    });
});

//add invited users to event
var userIdsInChat = [];
var userNamesInChat = [];
app.get('/api/addUsersToEvent', function(req, res) {
	var session = req.session;
	var chatOrganiserId = req.query.organiser_id;
	var chatOrganiserName = req.query.organiser_name;
	var inviteList = req.query.invited_user_info;
	var eventTitle = req.query.event_title;
	var timeStamp = Date();
	console.log(inviteList);
	console.log(eventTitle);

	//loop through invte list and add each one to usersInChat array
	for (var i = 0; i < inviteList.length; i++) {
		var invitedId = inviteList[i].userid;
		var invitedName = inviteList[i].username;
		userIdsInChat.push(invitedId);
		userNamesInChat.push(invitedName);
		console.log(userIdsInChat);
		console.log(userNamesInChat);
	};
	//create new chat in db with all invited users and event title
	Chat.create({
		chat_organiser_id: chatOrganiserId,
		chat_organiser_name: chatOrganiserName,
		user_ids_in_chat: userIdsInChat,
		user_names_in_chat: userNamesInChat,
		event_title: eventTitle,
		time_stamp: timeStamp
		}, (function(err, ids) {
    	if (err) {
     	   throw err;
    	} else {
       		console.log('saved new chat');
        	checkDb();
    	}
        	
	}));
	
	//check if data is being stored and send most recent
    var checkDb = function () {
      	Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    };
});

//add organiser's first message to db
app.get('/api/firstMessageToGroup', function(req, res) {
	var chatId = req.query.chat_id;
	var organiserAndGroup = req.query.organiser_and_group;
	var firstMessage = req.query.message;
	Chat.findByIdAndUpdate({_id: chatId}, {$push: {new_message: {firstMessage}}}, {new: true}, function(err, data) {
		if (err) {
			throw err;
		} else {
			checkDbForFirstMessage();
		}
	});
	
	//check if first message is being stored and send most recent
    var checkDbForFirstMessage = function () {
      	Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    };
});

//when first message is sent by organiser, all invited user ids receive a pop up saying they've
//been added to event, with a button that sends them to the chat overlay

//redirect to chat overlay screen after setting up chat group to display text box
//connect chat_organiser and user_ids_in_chat in chatroom
//add all new messages to db
//push all new messages to user_ids_in_chat (will need to cross reference against logged in user id)

var clients = {};
var rooms = {};

//connect clients with socket
io.on('connection', function(socket) {
    console.log('Client connected');
    var userId = (socket.handshake.session.user_id);
    
    //map user id with socket id and add to clients object
    socket.on('storeIds', function() {
        var clientId = socket.id;
        clients[userId] = {'client_id': clientId};
        console.log(clients);
    });
    
    //remove ids from clients array on disconnect
    socket.on('disconnect', function() {
        delete clients[userId];
        console.log('removed from clients: ' + userId);
        console.log(clients);
    });
    
    //joins client to room when conversation is selected
    /*socket.on('join', function(data) {
        socket.join(data.room);
        rooms[userId] = data.room;
        console.log(rooms);
        var roomsObj = io.sockets.clients();
        console.log(roomsObj.adapter.rooms);
    });
    
    //broadcasts messages to current room
    socket.on('messages', function(data) {
        var room = data.room;
        var receiver = data.receiver_id;
        var senderIcon = data.sender_icon;
        var newMessage = data.new_message;
        console.log(data.room);
        if(rooms.hasOwnProperty(receiver) && rooms[receiver] == room) {
            socket.broadcast.to(room).emit('messages', room, senderIcon, newMessage);
        }
    });
    
    //removes client from room when chat overlay is closed
    socket.on('leave', function(data) {
        socket.leave(data.room);
        delete rooms[userId];
        console.log(rooms);
        console.log(data.room);
        var roomsObj = io.sockets.clients();
        console.log(roomsObj.adapter.rooms);
    });

    //check if connected user is in the room    
    app.get('/api/checkInRoom', function(req, res) {
        var receiverId = req.query.receiver_id;
        var room = req.query.chat_id;
        if(rooms.hasOwnProperty(receiverId) && rooms[receiverId] == room) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    });*/
});



exports.app = app;
exports.runServer = runServer;
