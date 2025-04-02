const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/Expresserror.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer  = require('multer')
const {storage}=require("../cloudconfig.js")
const upload = multer({ storage })

//near listing enter collage
router.get("/near", async (req, res) => {
  res.render("listings/near.ejs"); // Ensure you have near.ejs in the views folder
});

// Route for filtering listings by collage
router.get("/near/:collage", async (req, res) => {
  const collage = decodeURIComponent(req.params.collage);

  if (!collage) {
      return res.render("listings/listings-near", { listings: [], collage: null, message: "Please select a collage." });
  }

  try {
      const listings = await Listing.find({ collage });

      if (listings.length === 0) {
          return res.render("listings/listings-near", { listings, collage, message: `No listings available for "${collage}".` });
      }

      res.render("listings/listings-near", { listings, collage, message: null });
  } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).send("Internal Server Error");
  }
});




// 🟢 Index Route - Show All Listings (Updated to include search)
router.get("/",   wrapAsync(async (req, res) => {
  let { search } = req.query;
  console.log("Search Query:", search); // Debugging log

  let query = {};
  if (search) {
      query.title = new RegExp(search, "i"); // Case-insensitive search
  }

  const allListings = await Listing.find(query).lean(); // Use lean() for optimization

  res.render("listings/index.ejs", { allListings, searchQuery: search || "" });
}));


// 🟢 New Route - Show Form to Create a Listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// 🟢 Create Route - Add a New Listing
// router.post("/",upload.single('listing[image]'), isLoggedIn, validateListing, wrapAsync(async (req, res) => {
//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   await newListing.save();
//   req.flash("success", "✅ Listing created successfully!");
//   res.redirect(`/listings/${newListing._id}`);
 
// }));


router.post("/", isLoggedIn, upload.single("listing[image]"), wrapAsync(async (req, res) => {
  if (!req.file) {
    req.flash("error", "Image upload failed. Please try again.");
    return res.redirect("/listings/new");
  }

  req.body.listing = req.body.listing || {}; // ✅ Ensure `listing` object exists
  req.body.listing.image = { 
    url: req.file.path, 
    filename: req.file.filename 
  };

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  
  await newListing.save();

  req.flash("success", "✅ Listing created successfully!");
  res.redirect(`/listings/${newListing._id}`);
}));




// 🟢 Show Route - Display a Single Listing
router.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
      .populate("owner")
      .populate({
          path: "reviews",
          populate: [
              { path: "author", select: "_id username" },
              { path: "replies.author", select: "_id username" }
          ]
      });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing, user: req.user  });
}));

// 🟢 Edit Route - Render Edit Form (Protected)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).lean();

  if (!listing) {
    req.flash("error", "❌ Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
}));

// 🟢 Update Route - Update Listing (Protected)
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!req.body.listing) {
    req.flash("error", "⚠️ Invalid update data!");
    return res.redirect(`/listings/${id}/edit`);
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "❌ Listing not found!");
    return res.redirect("/listings");
  }

  // 🟢 Update listing fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.contact = req.body.listing.contact;
  listing.collage = req.body.listing.collage;

  // 🖼️ Handle Image Upload (Only update if a new image is uploaded)
  if (req.file) {
    listing.image = { 
      url: req.file.path, 
      filename: req.file.filename 
    };
  }

  await listing.save();

  req.flash("success", "✅ Listing updated successfully!");
  res.redirect(`/listings/${id}`);
}));


// 🟢 Delete Route - Delete Listing (Protected)
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "❌ Listing not found or already deleted!");
    return res.redirect("/listings");
  }

  req.flash("success", "🗑️ Listing deleted successfully!");
  res.redirect("/listings");
}));

// 🟢 Search Route - Show Filtered Listings
router.get("/search", wrapAsync(async (req, res) => {
  let { search } = req.query;

  let query = {};
  if (search) {
    query.title = new RegExp(search, "i"); // Case-insensitive search
  }

  const searchResults = await Listing.find(query).lean();
  
  res.render("listings/search.ejs", { searchResults, searchQuery: search || "" });
}));






module.exports = router;
