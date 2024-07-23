const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");

const WrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
//signup route
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});
router.post(
  "/signup",
  WrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      let newUser = new User({
        email,
        username,
      });
      //register the user
      let regUser = await User.register(newUser, /* password */ password);
      req.login(regUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "new user created");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);

      res.redirect("/signup");
    }
  })
);
/* email: 'ac@gmail.com',
    username: 'aman20001', */
//login route
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login" /* in case of login fail redirect */,
    failureFlash: true,
  }),
  async (req, res) => {
    console.log("logged in successfully");

    req.flash("success", "welcome back to wanderlust");
    // console.log(res.locals.redirectUrl);

    let redirectUrl = res.locals.redirectUrl || "/listings";
    // console.log(res.locals.redirectUrl);

    res.redirect(redirectUrl);
  }
);
//logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out");
    res.redirect("/listings");
  });
});
module.exports = router;
