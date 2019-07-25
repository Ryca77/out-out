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

	//show list of users
	//NEED FUNCTIONALITY TO CONNECT WITH USERS AND CREATE FRIENDS LIST
	$('.findfriends').on('click', function() {
		$(this).hide();
		
		$.get('api/getUserList', function(users) {
			var userList = users
			
			console.log(users);
			for(var i = 0; i < users.length; i++) {
				var userName = users[i].username;
				var userId = users[i]._id;
				if(loggedInUserId !== userId) {
					$('.userlist').append('<p class="userlistitem" data-id="' + userId + '">' + userName + ' ' + '<button class="adduser">' + "Add" + '</button>' + '</p>')
					$('.userlist').show();
				}
				console.log(userName);
				console.log(userId);
			}
		});
		createInviteList();
	});
	//add users to array to invite to event
	var createInviteList = function() {
		var inviteList = [];
		$('.userlist').on('click', '.adduser', function() {
			var invited = $(this).parent().data('id');
			$(this).hide();
			$(this).parent().append('<button class="added">' + "Added" + '</button>');
			$('.invite').show();
			inviteList.push(invited);
		});

		//invite users to event
		$('.sendinvite').on('click', function() {
			var newInvite = $('.eventtitle').val();
			console.log(newInvite);
			if(newInvite.length) {
				var params = {inviteList};
				$.get('api/addUsersToEvent', params, function(response) {
					console.log(response);
				});
			}
		});
		
	}


	/*var inviteList = [];
	$('.userlist').on('click', '.adduser', function() {
		var invited = $(this).parent().data('id');
		$(this).hide();
		$(this).parent().append('<button class="added">' + "Added" + '</button>');
		$('.invite').show();
		inviteList.push(invited);
	});*/
	

	//invite users to event
		/*$('.sendinvite').on('click', function() {
			var newInvite = $('.eventtitle').val();
			console.log(newInvite);
			if(newInvite.length) {
				var params = {inviteList};
				$.get('api/addUsersToEvent', params, function(response) {
					console.log(response);
				});
			}
		});*/

	

});