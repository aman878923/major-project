//npm init -y
//npm i express
// npm i ejs
//npm i mongoose
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 8000;
const path = require("path");
//npm i ejs-mate
const ejsMate = require("ejs-mate");
//npm install uuid

const morgan = require("morgan");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const { v4: uuidv4 } = require("uuid");
//npm install method-override
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
//connecting mongoose
//sudo systemctl start mongod
// getting-started.js
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const multer = require("multer");
const URL = process.env.ATLASPASSWORD;
main()
  .then((res) => console.log("mongoose connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(URL/* "mongodb://127.0.0.1:27017/wanderlust" */);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
app.set("view engine ", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const store = MongoStore.create({
  mongoUrl: URL,
  crypto: {
    secret:"secretkey"
  },
  touchAfter:24*3600,
})
store.on("error",(err) => {
  console.log("error in mongo session");
})
// Configuration options for the session middleware
const cookieOptions = {
  store,
  secret: "secretkey", // Secret key used to sign the session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: true, // Save uninitialized sessions
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Set cookie expiration to 7 days from now
    maxAge: 7 * 24 * 60 * 60 * 1000, // Maximum age of the cookie in milliseconds (7 days)
    httpOnly: true, // Prevents client-side JS from reading the cookie
  },
};

//session middleware
app.use(session(cookieOptions));
app.use(flash());
// Initialize Passport

app.use(passport.initialize());
app.use(passport.session());
// Configure Passport Local Strategy

passport.use(new localStrategy(User.authenticate()));

// Serialize user for the session
passport.serializeUser(User.serializeUser());
// Deserialize user from the session
passport.deserializeUser(User.deserializeUser());

// app.get("/", (req, res) => {
//   res.send("get working");
// });
// Custom Morgan logging middleware configuration
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "abc@gmail.com",
    username: "aman",
  });
  //register the user
  let regUser = await User.register(fakeUser, /* password */ "helloworld");
  res.send(regUser);
});
// Route middleware setup
app.use("/listings", listingsRouter); // Mount the listings router at the /listings path
app.use("/listings/:id/reviews", reviewsRouter); // Mount the reviews router for specific listings
app.use("/", userRouter);
//error-handling middlewares

app.use("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.render("error.ejs", { err });
});

app.listen(port, () => {
  console.log(`your port is started at ${port} `);
});
