var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var bcrypt = require('bcryptjs');

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
	/*res.send(req.body);*/

	//validate user regstration entries
	if(!req.body) {
		return res.status(400).json({
			message: "No request body"
		});
	}

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

	//ENSURE EMAIL CONTAINS AT SYMBOL
	/*if(!('@' in email)) {
		return res.status(422).json({
			message: "Missing chatacter: email"
		});
	}*/

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
				email: email,
				username: username,
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
	User.find({}, 'email username password', function(err, data) {
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

//add password hashing



//add passport authentication


exports.app = app;
exports.runServer = runServer;
