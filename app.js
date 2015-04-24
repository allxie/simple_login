var express = require('express'),
bodyParser = require('body-parser'),
db = require("./models"),
session = require("express-session"),
app = express();

app.set("view engine", "ejs");
//setting up middleware for bodyParser
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: 'super secret', //put a secure random string in here
  resave: false,
  saveUninitialized: true
}));

//making our own middleware
// customLogin
app.use("/", function(req, res, next){


  req.login = function(user){
  	// set the key on session.userId
  	//req is the incoming req
  	//and the login key is what we made up (req.taco = function ...)
  	req.session.userId = user.id;
  }


  req.currentUser = function () {
    return db.User.
      find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };

  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next() // continue processing the req
});

//this is a first route
app.get("/signup", function (req, res) {
  res.send("Coming soon");
});

// Remember to have ?_method=POST and action =users
//for the form
app.post("/users", function(req, res){
  var user = req.body.user;
  db.User.createSecure(user.email, user.password)
  	.then(function(){
  		res.send("You're signed up!");				//	   /|\
  	})												//		|
});													//		|
// renders login view								//		|
app.get("/login", function (req, res) { 			//		|
  res.render("login");								//		|
});													//		|
													//		|
//login will authenticate a user 							|
app.post("/login", function(req, res){				//		|
  var user = req.body.user;							//		|
  db.User.authenticate(user.email, user.password)	//		|
  .then(function(user){								//		|
  	req.login(user);	// <----- from customLogin MidWare above
  	res.redirect("/profile");
  });
});

app.get("/profile", function(req, res){
	req.currentUser()
	  .then(function(user){
	  	res.render("profile.ejs", {user: user});
	  })
})






app.listen(3000, function () {
  console.log("SERVER RUNNING");
});