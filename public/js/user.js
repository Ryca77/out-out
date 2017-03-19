$(document).ready(function() {

	//get logged in user info
	$.get('/api/globalUserAttributes', function(response) {
	    var userName = response;
        console.log(response);
        $('.user').append('<div class="user-display">' + "Signed in as: " + userName + '</div>');
	});

	//send user logout request to server
	var userLogout = function() {
		$.get('/api/logOut', function(response) {
			console.log('logged out');
			console.log(response.session);
			//window.location = response.redirect;
		});
	}
	
	$('.logout').on('click', function() {
		userLogout();
	});

});