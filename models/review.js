// const { number } = require("joi");
const mongoose = require("mongoose");
const Listing = require("./listing.js"); // Import the Listing model
// const { MAX } = require("uuid");
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
// Middleware function to remove the review reference from the associated listing
reviewSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    try {
      await Listing.updateOne(
        { reviews: doc._id },
        { $pull: { reviews: doc._id } }
      );
    } catch (err) {
      console.error("Error removing review reference from listing:", err);
    }
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
