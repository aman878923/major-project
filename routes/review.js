const express = require("express");
const router = express.Router({ mergeParams: true });
const WrapAsync = require("../utils/WrapAsync");
const { isLoggedin, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviewController");

router
  .route("/")
  .post(
    isLoggedin,
    reviewController.validateReview,
    WrapAsync(reviewController.createReview)
  );

router
  .route("/:reviewId")
  .post(isLoggedin, isReviewAuthor, WrapAsync(reviewController.deleteReview));

module.exports = router;
