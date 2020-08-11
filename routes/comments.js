var express     = require("express"),
    router      = express.Router(),
    Campground  = require('../models/campgrounds'),
    Comment     = require("../models/comment"),
    middleware  = require('../middleware');

router.get("/:id/comments/new", middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
                res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/:id/comments",middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function (err, campground) {
            if (err) {
                console.log(err);
                res.redirect("campgrounds");
            } else {
                Comment.create(req.body.comment, function(err, comment){
                    if (err) {
                        req.flash("error","Something went wrong");
                        console.log(err);
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        console.log(comment);
                        campground.comments.push(comment);
                        campground.save();
                        req.flash("success","Successfully added comment");
                        res.redirect("/campgrounds/" + campground._id);
                    }
                });
            }
    });
});

// edit route
router.get("/:id/comments/:c_id/edit",middleware.checkCommentOwnership, function (req,res) {
    Comment.findById(req.params.c_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
        }
    });
});

// update route
router.put("/:id/comments/:c_id",middleware.checkCommentOwnership, function(req,res) {
    Comment.findByIdAndUpdate(req.params.c_id, req.body.comment, {useFindAndModify: false},function(err){
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// destroy routes
router.delete("/:id/comments/:c_id",middleware.checkCommentOwnership, function(req,res) {
    Comment.findByIdAndRemove(req.params.c_id, function(err){
        if (err) {
            res.redirect("back");
        }else{
            req.flash("success","Comment deleted!!!");
            res.redirect("back");
        }
    })
});


module.exports = router;
