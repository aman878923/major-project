const express = require("express");
const router = express.Router({ mergeParams: true });
const usersController = require("../controllers/users");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const WrapAsync = require("../utils/WrapAsync");

router
  .route("/signup")
  .get(usersController.renderSignup)
  .post(WrapAsync(usersController.signup));

router
  .route("/login")
  .get(usersController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usersController.login
  );

router.get("/logout", usersController.logout);

module.exports = router;
