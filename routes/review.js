const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const WrapAsync = require("../utils/WrapAsync");
const { reviewSchema } = require("../schema");
const Review = require("../models/review");
//reviews

//review validation
const validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);

  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};
// post route
router.post(
  "/",

  validateReview /* for validating the coming  object */,
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    let resultListing = await Listing.findById(id);
    let newReview = new Review(req.body);
    resultListing.reviews.push(newReview);
    await newReview.save();
    await resultListing.save();
    req.flash("success", "review added");

    res.redirect(`/listings/${id}`);
  })
);
//post delete route for reviews
router.post(
  "/:reviewId",
  WrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // db.listings.updateMany({},{$unset:{reviews:""}}) for deleting all reviews
    req.flash("success", "review deleted");

    res.redirect(`/listings/${id}`);
  })
);
module.exports = router;
