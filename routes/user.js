const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js"); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/Expresserror.js");
const passport = require("passport");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// Render the signup form
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Handle signup form submission
router.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    
    // Use passport-local-mongoose to hash password and save the user
    await User.register(user, password);
    req.flash("success", "Welcome to the site!");
    
    // Log the user in after registration
    passport.authenticate("local")(req, res, () => {
      res.redirect("/listings"); // Redirect to home or another page after successful signup
    });
  } catch (e) {
    next(new ExpressError(400, e.message)); // Handle errors (e.g., user already exists)
  }
}));

// Render the login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Handle login form submission
router.post("/login", passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login", // If authentication fails, redirect to login
}), (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/listings"); // Redirect to home or another page after successful login
});

// Handle logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings"); // Redirect to home or another page after logout
  });
});

// 🟢 **New Profile Route**
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
      console.log("Current User:", req.user); // Check if user is logged in

      const listings = await Listing.find({ owner: req.user._id });
      console.log("User Listings:", listings); // Check if listings are retrieved

      res.render("users/profile", { currUser: req.user, listings });
  } catch (err) {
      console.error("Error fetching profile:", err); // Log actual error
      req.flash("error", "Something went wrong!");
      res.redirect("/listings");
  }
});



module.exports = router;
