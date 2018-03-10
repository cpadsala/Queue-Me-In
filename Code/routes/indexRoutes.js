var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Merchant = require('../models/merchant');
var Queue = require('../models/queue');
var avgTime = 2; //time in minutes

/* Main function to make sure that the user is */
/* logged in before accessing session specific */
/* pages.                                      */
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}
/***********************************************/

// Get Homepage
router.get('/', function(req, res){
    res.render('index');
});

// Get the user landing page
router.get('/userlanding', ensureAuthenticated, function(req, res){
    Merchant.find({}, function(err, doc){
        if(err){
            res.send(500);
            return;
        }
        res.render('userlanding', {merchdata: doc});
    });
});

// Get the merchant landing page
router.post('/merchantlanding', ensureAuthenticated, function(req, res){
    Queue.find({businessUniqueID: req.body.businessUID}, function(err,doc){
        if(err) throw err;
        else res.render('merchantlanding', {queuedata: doc});
    });
});

// QueueStatus
router.post('/queuestatus', ensureAuthenticated, function(req, res){
    Merchant.findOne({businessUniqueID: req.body.queue}, function(err, merch){
        if(err) throw err;
        else 
        {
            console.log(merch);
            Queue.getQueueCount(req.body.queue, function(err, count){
                if(err) throw err;
                else
                {
                    console.log(count);
                    Queue.findOne({businessUniqueID: req.body.queue, email: req.body.user}, function(err, date){
                        if(err) throw err;
                        else
                        {
                            var queueDate = date.date;
                            console.log(date);
                            Queue.getQueuePosition(queueDate, req.body.queue, function(err, position){
                                if(err) throw err;
                                else
                                {
                                    console.log(position);
                                    var waitTime = (position-1) * avgTime;
                                    console.log(waitTime);
                                    res.render('queuestatus', {merchdata: merch, count: count, position: position, waitTime: waitTime});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// Register
router.get('/registerUser', function(req, res){
    res.render('registerUser');
});

router.get('/registerMerchant', function(req, res){
    res.render('registerMerchant');
});

// Login
router.get('/login', function(req, res){
    res.render('login');
});

/**************************************************************/
/* Passport functions to actually login as a user or merchant */
/**************************************************************/
passport.use('user', new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
        return done(null, false, {message: 'Unknown Username'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));
  
passport.use('merchant', new LocalStrategy(
  function(username, password, done) {
   Merchant.getMerchantByUsername(username, function(err, merchant){
    if(err) throw err;
    if(!merchant){
        return done(null, false, {message: 'Unknown Username'});
    }

    Merchant.comparePassword(password, merchant.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, merchant);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Merchant.getMerchantById(id, function(err, user){
    if(err) done(err);
        if(user){
            done(null, user);
        } else {
            User.getUserById(id, function(err, user){
                if(err) done(err);
                done(null, user);
            })
        }
    })
});

router.post('/loginuser',
  passport.authenticate(['user', 'merchant'], {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});

/******************************************************************************/

/* Clear session and log the yser out */
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

module.exports = router;