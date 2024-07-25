// controllers/users.js

const User = require("../models/user.js");
const passport = require("passport");

const usersController = {
  // Render signup form
  renderSignup: (req, res) => {
    res.render("users/signup.ejs");
  },

  // Handle user signup
  signup: async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      let newUser = new User({ email, username });
      let regUser = await User.register(newUser, password);
      req.login(regUser, (err) => {
        if (err) return next(err);
        req.flash("success", "new user created");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  },

  // Render login form
  renderLogin: (req, res) => {
    res.render("users/login.ejs");
  },

  // Handle user login
  login: (req, res) => {
    req.flash("success", "welcome back to wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  },

  // Handle user logout
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.flash("success", "you are logged out");
      res.redirect("/listings");
    });
  },
};

module.exports = usersController;
