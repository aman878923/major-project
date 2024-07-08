const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    default:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?ixlib=rb-4.0.3",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?ixlib=rb-4.0.3"
        : v,
  },
  description: String,
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
// db.listings.updateMany({},{$unset:{reviews:""}}) command to delete reviews key from object