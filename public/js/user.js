$(document).ready(function() {

	var socket = io();

	var addToEventIcon = './images/add-user-20px.png';

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
					$('.userlist').append('<p class="userlistitem" id="userlistitem" data-id="' + userId + '">' + userName + '<img class="adduser" src="' + addToEventIcon + '">' + '</p>')
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
			var invitedId = $(this).parent().data('id');
			var invitedName = $(this).parent().text();
			$(this).hide();
			$(this).parent().append('<button class="added">' + "Added" + '</button>');
			$('.invite').show();
			inviteList.push({"username": invitedName, "userid": invitedId});
		});
		console.log(loggedInUserId);
		//create event and set up group
		$('.sendinvite').on('click', function() {
			var newInvite = $('.eventtitle').val();
			$('.chat-overlay').show()
			$('.eventname').append(newInvite);
			console.log(newInvite);
			if(newInvite.length) {
				var params = {
					organiser_id: loggedInUserId,
					organiser_name: loggedInUserName,
					invited_user_info: inviteList,
					event_title: newInvite
				};
				$.get('api/addUsersToEvent', params, function(response) {
					console.log(response[0].user_ids_in_chat);
					console.log(response);
					var chatId = response[0]._id;
					var eventGroup = response[0].user_ids_in_chat;
					var eventOrganiser = response[0].chat_organiser_id;
					firstMessage(chatId, eventGroup, eventOrganiser);
				});
			}
		});
	};

	//first message sent by event organiser
	var firstMessage = function(chatId, eventGroup, eventOrganiser) {	
		$('.sendmessage').on('click', function() {
			console.log(eventGroup);
			console.log(eventOrganiser);
			var organserAndGroup = eventOrganiser.concat(',' + eventGroup);
			console.log(organserAndGroup);
			var message = $('.message').val();
			var params = {
				chat_id: chatId,
				organiser_and_group: organserAndGroup,
				message: message
			};
			$.get('api/firstMessageToGroup', params, function(response) {
				console.log(response[0].new_message);
			});
		});
	};

	/*var addLiveMessage = function(room, message) {
        var scrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
        var chatId = room;
        $('.chat').append('<div class="new-chat" data-id="'+ chatId +'">' + '<img class="message-pic" src="' + icon + '">' + message + '</div>');
        if (scrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    };    
    
    var addLiveToDatabase = function(room, icon, message) {
        var params = {
            chat_id: room,
            new_message: message
        };
        $.get('/api/addMessages', params, function(response) {
            console.log(response);
        });
    };*/

	//emit to server on connection to store store instagram id against socket id
    /*socket.on('connect', function () {
        socket.emit('storeIds');
    });
    
    var joinRoom = function(id) {
        var room = id;
        socket.emit('join', {room: room});
    };
        
    var liveChat = function(room, receiver, icon, message) {
        addLiveMessage(room, message);
        addLiveToDatabase(room, message);
        socket.emit('messages', {room: room, receiver_id: receiver, new_message: message});
    };
    
    var leaveRoom = function(id) {
        var room = id;
        socket.emit('leave', {room: room});
    };
    
    socket.on('messages', addLiveMessage);*/

	

});