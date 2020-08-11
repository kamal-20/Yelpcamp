var express     = require("express"),
    router      = express.Router(),
    Campground  = require('../models/campgrounds'),
    Comment     = require("../models/comment"),
    middleware  = require('../middleware'),
    multer      = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dsys26psh',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



router.get("/",function (req,res) {
    Campground.find({}, function(err,campgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:campgrounds, currentUser: req.user});
        }
    });
});


router.get("/new",middleware.isLoggedIn ,function(req,res) {
    res.render("campgrounds/new");
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      req.body.campground.image = result.secure_url;
// add author to campground
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

router.get("/:id", function(req,res) {
    Campground.findById(req.params.id).populate("comments").exec( function(err,campgroundfound) {
        if(err){
            console.log(err);
        } else {
                console.log(campgroundfound);
                res.render("campgrounds/show",{campground: campgroundfound});
        }
    });

});

//edit campgroundRoutes
router.get("/:id/edit",middleware.checkUser, function(req,res){
        Campground.findById(req.params.id, function(err,foundcampground) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/edit",{campground: foundcampground});
            }
        });
});

router.put("/:id",middleware.checkUser, function(req,res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

////destroy routes
router.delete("/:id",middleware.checkUser, function(req,res) {
        Campground.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.redirect("back");
            } else {
                res.redirect("/campgrounds");
            }
        })
})


module.exports = router;
