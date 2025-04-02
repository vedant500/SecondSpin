// const express = require("express");
// const router=express.Router({mergeParams:true});
// const wrapAsync =require("../utils/wrapasync.js")
// const ExpressError=require("../utils/Expresserror.js")
// const Review =require("../models/review.js")
// const { replySchema } = require("../schema.js");

// const validateReply = (req, res, next) => {
//   console.log("Request Body:", req.body);
//   let { error } = replySchema.validate(req.body);
//   if (error) {
//     const errorMessages = error.details.map(err => err.message).join(", ");
//     req.flash("error", errorMessages);
//   } else {
//     next();
//   }
// };

// router.post("/", validateReply, wrapAsync(async (req, res) => {
//   const { listingId, reviewId } = req.params;

//   // Find the review
//   const review = await Review.findById(reviewId);
//   if (!review) {
//     req.flash("error", "Review not found.");
//   }

//   // Add the reply to the replies array
//   review.replies.push({ comment: req.body.reply.comment });

//   // Save the updated review
//   await review.save();
//   req.flash("success", "Reply added successfully!");
//   // Redirect back to the listing page
//   res.redirect(`/listings/${listingId}`);
// }));

// // Delete Reply Route
// router.delete("/:replyId", wrapAsync(async (req, res) => {
//   const { listingId, reviewId, replyId } = req.params;

//   // Find the review and remove the specific reply
//   await Review.findByIdAndUpdate(reviewId, { $pull: { replies: { _id: replyId } } });
  
//   req.flash("success", "Reply deleted successfully!");
  
//   res.redirect(`/listings/${listingId}`);
// }));

// module.exports=router;


const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { replySchema } = require("../schema.js");
const { isLoggedIn, isReplyAuthor } = require("../middleware.js");

// Enhanced reply validation middleware
const validateReply = (req, res, next) => {
  const { error } = replySchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(err => err.message).join(", ");
    req.flash("error", errorMessages);
    return res.redirect(`/listings/${req.params.listingId}`);
  }
  next();
};

// POST route to add a reply
router.post("/", 
  isLoggedIn,
  validateReply,
  wrapAsync(async (req, res) => {
    const { listingId, reviewId } = req.params;
    const { comment } = req.body.reply;

    // Find the review with proper error handling
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect(`/listings/${listingId}`);
    }

    // Add reply with author information
    review.replies.push({
      comment,
      author: req.user._id  // Associate reply with current user
    });

    await review.save();
    req.flash("success", "Reply added successfully!");
    res.redirect(`/listings/${listingId}`);
  })
);

// DELETE route to remove a reply
router.delete("/:replyId",
  isLoggedIn,
  isReplyAuthor,  // Authorization middleware
  wrapAsync(async (req, res) => {
    const { listingId, reviewId, replyId } = req.params;

    // More robust deletion with error handling
    const result = await Review.updateOne(
      { _id: reviewId },
      { $pull: { replies: { _id: replyId } } }
    );

    if (result.modifiedCount === 0) {
      req.flash("error", "Reply not found or already deleted");
      return res.redirect(`/listings/${listingId}`);
    }

    req.flash("success", "Reply deleted successfully!");
    res.redirect(`/listings/${listingId}`);
  })
);

module.exports = router;