$(document).ready(function() {

	var socket = io();

	//get logged in user info
	$.get('/api/globalUserAttributes', function(response) {
	    window.loggedInUserName = response.username;
	    window.loggedInUserId = response.userid;
        console.log(response);
        console.log(loggedInUserId);
        $('.user').append('<div class="user-display">' + "Signed in as: " + loggedInUserName + '</div>');
	});

	//send user logout request to server
	var userLogout = function() {
		$.get('/api/logOut', function(response) {
			console.log('logged out');
			console.log(response.session);
			window.location = response.redirect;
		});
	}
	
	$('.logout').on('click', function() {
		userLogout();
	});

	//search users and connect with friends
	$('.findfriends').on('click', function() {
		$(this).hide();
		
		$.get('api/getUserList', function(users) {
			var userList = users
			console.log(users);
			for(var i = 0; i < users.length; i++) {
				var userName = users[i].username;
				var userId = users[i]._id;
				if(loggedInUserId !== userId) {
					$('.user-list').append('<p class="userlistitem" data-id="' + userId + '">' + userName + ' ' + '<button class="addUser">' + "Add" + '</button>' + '</p>')
					$('.user-list').show();
				}
				console.log(userName);
				console.log(userId);
			}
		});
	});

});