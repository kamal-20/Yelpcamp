var express           = require('express'),
  app                 = express(),
  bodyParser          = require("body-parser"),
  mongoose            = require("mongoose"),
  Campground          = require("./models/campgrounds"),
  Comment             = require("./models/comment"),
  User                = require("./models/user"),
  passport            = require('passport'),
  LocalStrategy       = require("passport-local"),
  methodOverride      = require('method-override'),
  moment              = require('moment'),
  flash               = require('connect-flash');

//routes

var commentRoutes = require('./routes/comments'),
  campgroundRoutes = require('./routes/campgrounds'),
  indexRoutes = require('./routes/auth');


mongoose.connect("mongodb+srv://kamlendra:"+ process.env.mongoosepwd + "@cluster0-wfsgg.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

//////Passport configurations////////////////

app.use(require("express-session")({
  secret: "secret to secret hai",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
  res.locals.moment = moment;
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds", commentRoutes);

////////////////moment//////////////////////////////


///==========================================listener==================================//
app.listen(process.env.PORT || 405, function() {
  console.log("the server has started");
});
