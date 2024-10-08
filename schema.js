const joi = require("joi");
//validation schema for listings

module.exports.listingSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  location: joi.string().required(),
  country: joi.string().required(),
  price: joi.number().required().min(0),
  image: {
    url: joi.string().allow("", null),
    filename: joi.string().allow("", null),
  },
});

//validation schema for review
module.exports.reviewSchema = joi
  .object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required(),
  })
  .required();
