var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Merchant Schema
var MerchantSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	firstname: {
		type: String
	},
	lastname: {
		type: String
	},
	phonenumber: {
		type: Number
	},
	businessname: {
		type: String
	},
	businessAddress: {
		type: String
	},
	businessCity: {
		type: String
	},
	businessState: {
		type: String
	},
	businessZip: {
		type: Number
	},
	businessUniqueID: {
		type: String
	}
});

var Merchant = module.exports = mongoose.model('Merchant', MerchantSchema);

module.exports.createMerchant = function(newMerchant, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newMerchant.password, salt, function(err, hash) {
	        newMerchant.password = hash;
	        newMerchant.save(callback);
	    });
	});
}

module.exports.getMerchantByUsername = function(username, callback){
	var query = {username: username};
	Merchant.findOne(query, callback);
}

module.exports.getMerchantById = function(id, callback){
	Merchant.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}