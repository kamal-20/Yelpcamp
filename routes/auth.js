var express     = require("express"),
    router      = express.Router(),
    passport    = require('passport'),
    User        = require("../models/user");

router.get("/",function(req,res) {
        res.render("campgrounds/landing");
    });

router.get("/register", function(req,res) {
    res.render("register");
});

router.post("/register", function(req,res) {
    var newUser={
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        avatar: req.body.avatar
    }
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res, function() {
            req.flash("success","Welcome to Yelpcamp  "+ user.username);
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", function (req,res) {
    res.render("login");
});

router.post("/login",passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res) {

});

router.get('/logout',function(req,res){
    req.logout();
    req.flash("success","Logged you out!");
    res.redirect("/campgrounds");
});

////user profile
router.get("/users/:id", function(req,res) {
    User.findById(req.params.id,function(err,foundUser) {
        if (err) {
            req.flash("error","some problem occured");
            res.redirect("back");
        } else{
            console.log(foundUser);
            res.render("users/show",{user: foundUser});
        }
    });
});
module.exports = router;
