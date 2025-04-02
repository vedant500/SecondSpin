const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync =require("../utils/wrapasync.js")
const {listingSchema,reviewSchema}=require("../schema.js")
const ExpressError=require("../utils/Expresserror.js")
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const Review =require("../models/review.js")

const validateReview=(req,res,next)=>{
  console.log("Request Body:", req.body);
  let {error}=reviewSchema.validate(req.body)
  if (error){
    const errorMessages = error.details.map(err => err.message).join(", ");
    req.flash("error", errorMessages);
  }else{next()}
}


//Create
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id; // ✅ Assigning the author

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success", "Query added successfully!");
  res.redirect(`/listings/${listing._id}`);
}));


// Delete Review Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  console.log(id)

  // Remove the review reference from the listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete the review from the reviews collection
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Query deleted successfully!");

  res.redirect(`/listings/${id}`);
}));


module.exports=router;


