// controllers/reviewController.js

const Listing = require("../models/listing");
const Review = require("../models/review");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

const reviewController = {
  validateReview: (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    if (result.error) {
      let errMsg = result.error.details.map((el) => el.message).join(",");
      throw new ExpressError(404, errMsg);
    } else {
      next();
    }
  },

  createReview: async (req, res) => {
    let { id } = req.params;
    let resultListing = await Listing.findById(id);
    let newReview = new Review(req.body);
    newReview.author = req.user._id;
    resultListing.reviews.push(newReview);
    await newReview.save();
    await resultListing.save();
    req.flash("success", "review added");
    res.redirect(`/listings/${id}`);
  },

  deleteReview: async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
  },
};

module.exports = reviewController;
