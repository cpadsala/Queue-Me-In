var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Queue Schema
var QueueSchema = mongoose.Schema({
	businessUniqueID: {
		type: String
	},
	firstname: {
		type: String
	},
	lastname: {
		type: String
	},
	email: {
		type: String
	},
	phonenumber: {
		type: Number
	},
	date: {
		type: Date, 
		default: Date.now // This is in milliseconds
	}
});

var Queue = module.exports = mongoose.model('Queue', QueueSchema);

module.exports.createQueue = function(newQueue, callback){
		newQueue.save(callback);
};

module.exports.getQueueByEmail = function(em, callback){
	Queue.findOne({email: em}, callback);
}

module.exports.getQueueByLastname = function(lstn, callback){
	Queue.findOne({lastname: lstn}, callback);
}

module.exports.getQueueByBusinessName = function(businessname, callback){
	Queue.find({businessUniqueID: businessname}, callback);
}

module.exports.getQueueById = function(id, callback){
	Queue.findById(id, callback);
}

module.exports.getQueueCount = function(businessID, callback){
    Queue.find({businessUniqueID:businessID}).count(callback);
}

module.exports.getQueuePosition = function(date, businessID, callback){
	Queue.find({businessUniqueID: businessID, date: {$lte: date}}).count(callback);
}