module.exports.isLoggedin = (req, res, next) => {
  console.log(req);
  if (!req.isAuthenticated()) {
    /* for authenticating user loggedin or not  */
    req.flash("error", "you must be logged in");
    return res.redirect("/login");
  }
  next();
};
