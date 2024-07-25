const express = require("express");
const router = express.Router({ mergeParams: true });
const listingsController = require("../controllers/listing.js");
const { isLoggedin, isOwner } = require("../middleware.js");
const WrapAsync = require("../utils/WrapAsync");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
// Index route
router
  .route("/")
  .get(WrapAsync(listingsController.index))
  .post(
    isLoggedin,
    
    upload.single("image"),
    listingsController.validateListing,
    WrapAsync(listingsController.create)
  );

// New route
router.get("/new", isLoggedin, listingsController.renderNewForm);

// Show, Update, and Delete routes
router
  .route("/:id")
  .get(WrapAsync(listingsController.show))
  .put(
    isLoggedin,
    isOwner,
    upload.single("image"),
    listingsController.validateListing,
    WrapAsync(listingsController.update)
  )
  .delete(isLoggedin, isOwner, WrapAsync(listingsController.delete));

// Edit route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  WrapAsync(listingsController.renderEditForm)
);

module.exports = router;
