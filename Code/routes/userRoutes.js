var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var User = require('../models/user');
var Queue = require('../models/queue');

var avgTime = 2; // MINUTES

// Add to Queue
router.post('/addtoqueue', function(req, res){
	// Need to check if the user is already queued somewhere else
	User.findOne({username: req.body.email}, function(err, result){
		if(err) throw err;
		if(result.queued === false && result.businessQueued === null)
		{
			// If the user is not queued in anywhere,
			// then check the business queue to make sure that user is not in there
			Queue.findOne({businessUniqueID: req.body.businessQueued, email: req.body.email}, function(cb, query){
				if(err) throw err;
				else
				{
					if(!query)
					{
					// If the user is not in the queue, then we can add in the user into the queue.
						var newQueue = new Queue({
							businessUniqueID: req.body.businessQueued,
							firstname: req.body.firstname,
							lastname: req.body.lastname,
							email: req.body.email,
							phonenumber: req.body.phonenumber,
						});
						Queue.createQueue(newQueue, function(err, queue){
							if(err) throw err;
						});

				// Update the tags in the user so that he can't queue anywhere else
						User.findOneAndUpdate({username:req.body.email}, {queued: true, businessQueued: req.body.businessQueued}, function(err){
							if(err) throw err;
							else{
								req.flash('You have queued into '+ req.body.businessQueued);
								res.redirect('/');
							}
						});
					}
					else
					{
						// User is already in the specific queue
						req.flash('You are already in this queue!');
						res.redirect('/');
					}
				}	
			});
			
		}
		else
		{
			// User is already in a queue
			req.flash('You are already in a queue!');
			res.redirect('/');
		}	
	});
});

// Queue Out
router.post('/queuemeout', function(req,res){
	Queue.findOneAndRemove({businessUniqueID: req.body.queue, email: req.body.email}, function(err){
		if(err) throw err;
		else
		{
			User.findOneAndUpdate({username: req.body.email}, {businessQueued: null, queued: false}, function(err){
				if(err) throw err;
				else
				{
					req.flash('You have queued yourself out!');
					res.redirect('/');				
				}
			});
		}
	});
});

// Register User
router.post('/registeruser', function(req, res){
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
		res.render('/registeruser',{
			errors:errors
		});
	}
	else
	{
		User.findOne({username:username}, function(err, result){
		if(err) throw err;
		// If user is not registered, then register user
			if(!result)
			{
				var newUser = new User({
					firstname: firstname,
					lastname: lastname,
					phonenumber: phonenumber,
					username: username,
					password: password
			});

			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(user);
			});

			req.flash('success_msg', 'You are registered and can now login');
			res.redirect('/login');
			}
			else
			{
				console.log('Found same email already registered for another User.');
				req.flash('error_msg', 'Cannot Register: Email already registered');
				res.redirect('/registeruser');
			}
		});
	}
});

module.exports = router;