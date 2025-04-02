const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image:{
    url:String,
    filename:String,
},
  price: Number,
  contact: {
    type: String, // Changed from Number to String to prevent issues with leading zeros
    required: true, // Ensure contact is always provided
  },
  collage: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Ensure "User" is the correct model name
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;