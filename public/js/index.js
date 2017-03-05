$(document).ready(function() {

	//collect registration details and send to server
	var newUser = function() {
		var username = $('.username').val();
		var email = $('.email').val();
		var password = $('.password').val();
		var params = {
			username: username,
			email: email,
			password: password
		}
		console.log(params);
		if(username.length && email.length && password.length) {
			$.post('/api/registration', params, function(response) {
    	       	console.log(response);
    	   	});
		}
	}

	$('.reg-submit').on('click', function() {
		console.log('clicked')
		newUser();
	});

	//check to see if new user data saves to db
	var checkReg = function() {
		$.get('api/regInfo', function(response) {
			console.log(response);
		});
	}

	$('.login').on('click', function() {
		checkReg();
	});

	//authenticate user
	var userAuthentication = function() {
		var email = $('.email').val();
		var password = $('.password').val();
		var params = {
			email: email,
			password: password
		}
		if(email.length && password.length) {
			$.get('/api/authentication', params, function(response) {
				window.location = response.redirect;
				console.log(response);
			});
		}
	}

	$('.log-submit').on('click', function() {
		userAuthentication();
	});

	//get route to send logged in user info to front end


	//show login and sign up fields and submit buttons
	$('.register').on('click', function() {
		$('.name').show();
		$('.username').show();
		$('.email').show();
		$('.password').show();
		$('.log-submit').hide();
		$('.reg-submit').show();
	});

	$('.login').on('click', function() {
		$('.name').hide();
		$('.username').hide();
		$('.email').show();
		$('.password').show();
		$('.log-submit').show();
		$('.reg-submit').hide();
	});

});