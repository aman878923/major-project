//npm init -y
//npm i express
// npm i ejs
//npm i mongoose

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
//npm i ejs-mate
const ejsMate = require("ejs-mate");
//npm install uuid
const { v4: uuidv4 } = require("uuid");
//npm install method-override
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const WrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const Review = require("./models/review.js");

//connecting mongoose
//sudo systemctl start mongod
// getting-started.js
const mongoose = require("mongoose");
const { title } = require("process");
const { log } = require("console");

main()
  .then((res) => console.log("mongoose connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine ", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () => {
  console.log(`your port is started at ${port} `);
});
app.get("/", (req, res) => {
  res.send("get working");
});
//listing validation
const ValidateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};
//review validation
const validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    let errMsg = result.error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};
//index route
app.get("/listings", async (req, res) => {
  const allListing = await Listing.find();
  //console.log(allListing);
  res.render("listings/index.ejs", { allListing });
});
//new route
app.get(
  "/listings/new",
  WrapAsync((req, res) => {
    res.render("listings/new.ejs");
  })
);
//show route
app.get(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    let listing = await Listing.findById(id);
    let reviw = await Review.find({ _id: { $in: listing.reviews } });

    console.log(reviw);
    res.render("listings/show.ejs", { listing, reviw });
  })
);
//insert route
app.post(
  "/listings",
  ValidateListing,
  WrapAsync(async (req, res, next) => {
    const listingNew = new Listing(req.body);

    try {
      const result = await listingNew.save();
      console.log(result);
      res.redirect("/listings");
    } catch (err) {
      console.log(err);
      next(err);
    }
  })
);

//update route
app.get(
  "/listings/:id/edit",

  WrapAsync(async (req, res, next) => {
    try {
      let { id } = req.params;
      let listing = await Listing.findById(id);
      res.render("listings/update.ejs", { listing });
    } catch (err) {
      next(err);
    }
  })
);
//updating data into db
app.put(
  "/listings/:id",
  ValidateListing,
  WrapAsync(async (req, res) => {
    console.log(req.body);
    let { id } = req.params;
    let updateListing = req.body;
    let update = await Listing.findByIdAndUpdate(id, updateListing, {
      new: true,
    });
    console.log(update);
    //redirect to show path
    res.redirect(`/listings/${id}`);
  })
);
///delete route
app.delete(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    console.log("working");
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    console.log(delListing);
    res.redirect("/listings");
  })
);
//reviews
// post route
app.post(
  "/listings/:id/reviews",
  validateReview /* for validating the coming  object */,
  WrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(req.body);
    let resultListing = await Listing.findById(id);
    let newReview = new Review(req.body);
    resultListing.reviews.push(newReview);
    await newReview.save();
    await resultListing.save();
    res.redirect(`/listings/${id}`);
  })
);
//post delete route for reviews
app.post(
  "/listings/:id/reviews/:reviewId",
  WrapAsync(async (req, res) => {
    res.send("working");
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // db.listings.updateMany({},{$unset:{reviews:""}}) for deleting all reviews
    res.redirect(`/listings/${id}`);
  })
);
//error-handling middlewares
app.use("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.render("error.ejs", { err });
  //res.status(statusCode).send(message);
});
