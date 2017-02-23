var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

//var app = express();
//var jsonParser = bodyParser.json();

var app = require('express')();
var server = require('http').Server(app);

var User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

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
	res.send(req.body);

	/*if(!req.body) {
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

	var user = new User({
		username: username,
		password: password
	});

	user.save(function(err) {
		if(err) {
			return res.status(500).json({
				message: "Internal server error"
			});
		}

		return res.status(201).json({});
	}); */

});

//add password hashing
//add passport authentication


exports.app = app;
exports.runServer = runServer;
