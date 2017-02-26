$(document).ready(function() {

//collect registration details and send to server
var newUser = function() {
	var email = $('.email').val();
	var username = $('.username').val();
	var password = $('.password').val();
	var params = {
		email: email,
		username: username,
		password: password
	}
	console.log(params);
	if(email.length && username.length && password.length) {
		$.post('/api/registration', params, function(response) {
           	console.log(response);
       	});
	}
}

$('.submit').on('click', function() {
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

});