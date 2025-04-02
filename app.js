require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsLayouts = require("express-ejs-layouts");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/Expresserror.js");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews"); 
const repliesRouter = require("./routes/reply");
const userRouter = require("./routes/user.js");

const dbURI = process.env.ATLASDB_URL

async function main() {
  try {
    // Connect to MongoDB without the deprecated options
    await mongoose.connect(dbURI);

    console.log("Connected to MongoDB");

    // Start the server
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
}


main();

const session = require("express-session");

const sessionOption = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 10 }, // 10 minutes
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass flash messages to views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Middleware to make the current user available in all views
app.use((req, res, next) => {
  res.locals.currUser = req.user; // This attaches the logged-in user to res.locals
  next();
});

app.use((req, res, next) => {
  res.locals.searchQuery = req.query.search || "";
  next();
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);
app.set("layout", "layouts/boilerplate");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(flash());

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// listings
app.use("/listings", listingsRouter);

// review
app.use("/listings/:id/reviews", reviewRouter);

// reply
app.use("/listings/:listingId/reviews/:reviewId/reply", repliesRouter);

// User authentication
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.render("error.ejs", { message });
});
