const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedin = (req, res, next) => {
  console.log(req, "--", req.originalUrl);
  if (!req.isAuthenticated()) {
    //redirectinfourlr
    console.log(req.originalUrl);
    req.session.redirectUrl = req.originalUrl;
    console.log(req.session.redirectUrl);

    /* for authenticating user loggedin or not  */
    req.flash("error", "you must be logged in");
    return res.redirect("/login");
  }
  next();
};
//for storing redirect url in locals
module.exports.saveRedirectUrl = (req, res, next) => {
  console.log("working savingurl");
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    console.log(res.locals.redirectUrl);
  }
  next();
};
// for checking if the current user is owner or not
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
