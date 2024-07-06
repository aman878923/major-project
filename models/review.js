// const { number } = require("joi");
const mongoose = require("mongoose");
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
module.exports = reviewSchema;
