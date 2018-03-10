var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var Merchant = require('../models/merchant');
var User = require('../models/user');
var Queue = require('../models/queue');

var avgTime = 2; // MINUTES

// Register Merchant
router.post('/registermerchant', function(req, res){
	var businessname = req.body.businessname;
	var businessAddress = req.body.businessAddress;
	var businessCity = req.body.businessCity;
	var businessState = req.body.businessState;
	var businessZip = req.body.businessZip;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	
	if(errors){
		res.render('registerMerchant',{
			errors:errors
		});
	}
	else
	{
		Merchant.findOne({username:username}, function(err, result){
			if(err) throw err;
			// If merchant is not registered, then register merchant
			if(!result)
			{
				var businessUID = businessname+username;
				businessUID = businessUID.replace(/\s+/g, '');
				var newMerchant = new Merchant({
					businessname: businessname,
					businessAddress: businessAddress,
					businessCity: businessCity,
					businessState: businessState,
					businessZip: businessZip,
					firstname: firstname,
					lastname: lastname,
					phonenumber: phonenumber,
					username: username,
					password: password,
					businessUniqueID: businessUID
				});

				Merchant.createMerchant(newMerchant, function(err, merchant){
					if(err) throw err;
					console.log(merchant);
				});

				req.flash('success_msg', 'You are registered and can now login');
				res.redirect('/login');
			}
			else
			{
				console.log('Found same email already registered for another Merchant.');
				req.flash('error_msg', 'Cannot Register: Email already registered');
				res.redirect('/registerMerchant');
			}
		});
	}
});

// Merchant Delete User from queue
router.post('/completeTransaction', function(req, res){
	// Need to determine the businessQueue then remove queued user. 
	console.log(req.body.businessQueue);
	console.log(req.body.id);
	console.log(req.body.email);
	Queue.findOneAndRemove({ businessUniqueID: req.body.businessQueue, _id: ObjectId(req.body.id) }, function(err, todo) {
        if (err) throw err;
        else {
        	User.findOneAndUpdate({username: req.body.email},{businessQueued: null, queued: false}, function(err, todo){
        		if(err) throw err;
        		else
        		{
        			Queue.find({ businessUniqueID: req.body.businessQueue }, function(err, doc) {
                		if (err) throw err;
                		else res.render('merchantlanding', { queuedata: doc });
            		});
        		}
        	});
        }
	});
});

module.exports = router;
