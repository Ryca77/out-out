$(document).ready(function() {

	//get logged in user info
	$.get('/api/globalUserAttributes', function(response) {
	    var userName = response.username;
        console.log(response);
	});

});