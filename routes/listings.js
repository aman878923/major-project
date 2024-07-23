// routes/listings.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const User = require("../models/user.js");

const WrapAsync = require("../utils/WrapAsync");
const { listingSchema } = require("../schema");
const Review = require("../models/review");
const { isLoggedin, isOwner } = require("../middleware.js");

// Validation middleware
const ValidateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

//index route
router.get("/", async (req, res) => {
  const allListing = await Listing.find();
  //console.log(allListing);
  res.render("listings/index.ejs", { allListing });
});
//new route
router.get("/new", isLoggedin, (req, res) => {
  res.render("listings/new.ejs");
});
//show route
router.get(
  "/:id",
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "listing  does not exist");
      res.redirect("/listings");
    }

    let reviw = await Review.find({ _id: { $in: listing.reviews } });
    let owner = await User.findById(listing.owner);

    res.render("listings/show.ejs", { listing, reviw, owner });
  })
);
//create route
router.post(
  "/",
  isLoggedin,
  ValidateListing,
  WrapAsync(async (req, res, next) => {
    const listingNew = new Listing(req.body);
    //save user info in the listing object
    listingNew.owner = req.user._id;

    try {
      const result = await listingNew.save();

      req.flash("success", "new listing created");
      res.redirect("/listings");
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
);

//update route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,

  WrapAsync(async (req, res, next) => {
    try {
      let { id } = req.params;
      let listing = await Listing.findById(id);
      if (!listing) {
        req.flash("error", "listing  does not exist");
        res.redirect("/listings");
      }

      res.render("listings/update.ejs", { listing });
    } catch (err) {
      next(err);
    }
  })
);
//updating data into db
router.put(
  "/:id",
  ValidateListing,
  isOwner,
  WrapAsync(async (req, res) => {
    let { id } = req.params;
    let updateListing = req.body;

    await Listing.findByIdAndUpdate(id, updateListing, {
      new: true,
    });
    req.flash("success", " listing updated");

    //redirect to show path
    res.redirect(`/listings/${id}`);
  })
);
///delete route
router.delete(
  "/:id",
  isLoggedin,
  isOwner,
  WrapAsync(async (req, res) => {
    console.log("working");
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");

    await Review.deleteMany({ _id: { $in: delListing.reviews } });
    res.redirect("/listings");
  })
);

module.exports = router;
