// controllers/listings.js

const Listing = require("../models/listing");
const User = require("../models/user.js");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");


const listingsController = {
  // Index - Show all listings
  index: async (req, res) => {
    const allListing = await Listing.find();
    res.render("listings/index.ejs", { allListing });
  },

  // New - Show form to create new listing
  renderNewForm: (req, res) => {
    res.render("listings/new.ejs");
  },

  // Show - Show details of one listing
  show: async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "listing does not exist");
      return res.redirect("/listings");
    }
    let reviw = await Review.find({ _id: { $in: listing.reviews } }).populate(
      "author"
    );
    let owner = await User.findById(listing.owner);
    res.render("listings/show.ejs", { listing, reviw, owner });
  },

  // Create - Create a new listing
  create: async (req, res) => {
    console.log(req.file);
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(req.body);
    const listingNew = new Listing(req.body);
    listingNew.image = { url, filename };

    listingNew.owner = req.user._id;
    await listingNew.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
  },

  // Edit - Show form to edit listing
  renderEditForm: async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "listing does not exist");
      return res.redirect("/listings");
    }
    let originalImgUrl = listing.image.url;
    let modifiedImgUrl = originalImgUrl.replace(
      "/upload",
      "/upload/ar_1:1,c_auto,g_auto,w_200/r_50:50:50:50"
    );
    res.render("listings/update.ejs", { listing, modifiedImgUrl });
  },

  // Update - Update a listing
  update: async (req, res) => {
    let { id } = req.params;
    let updateListing = req.body;

    let listingNew = await Listing.findByIdAndUpdate(id, updateListing, {
      new: true,
    });
    if (typeof req.file != "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listingNew.image = { url, filename };
      await listingNew.save();
    }

    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
  },
  //to search a listing
  search: async(req, res) => {
  
    const searchText = req.query.search;
    const query = {
      $or: [
        { title: { $regex: new RegExp(searchText, 'i') } }, // Case-insensitive search in title
        { description: { $regex: new RegExp(searchText, 'i') } }, // Case-insensitive search in description
        { location: { $regex: new RegExp(searchText, 'i') } } // Case-insensitive search in location
      ]
    };
  
    // Find listings matching the query
    const allListing = await Listing.find(query);
    
    // Send response
    
    res.render("listings/index.ejs", { allListing});
    console.log(req.query);
    
  },

  // Delete - Delete a listing
  delete: async (req, res) => {
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    await Review.deleteMany({ _id: { $in: delListing.reviews } });
    res.redirect("/listings");
  },
  
  // Validation middleware
  validateListing: (req, res, next) => {
    let result = listingSchema.validate(req.body);
    if (result.error) {
      let errMsg = result.error.details.map((el) => el.message).join(",");
      throw new ExpressError(404, errMsg);
    } else {
      next();
    }
  },
};

module.exports = listingsController;
