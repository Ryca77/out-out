var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
    chat_organiser_id: {type: String, required: true},
    chat_organiser_name: {type: String, required: true},
    user_ids_in_chat: {type: String, required: true},
    user_names_in_chat: {type: String, required: true},
    event_title: {type: String, required: true},
    new_message: {type: Array, required: false},
    time_stamp: {type: String, required: true}
});

var Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;