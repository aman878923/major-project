const joi = require("joi");
//validation schema for listings

module.exports.listingSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  location: joi.string().required(),
  country: joi.string().required(),
  price: joi.number().required().min(0),
  image: joi.string().allow("", null),
});

//validation schema for review
module.exports.reviewSchema = joi
  .object({
    rating: joi.number().required(),
    comment: joi.string().required(),
  })
  .required();
