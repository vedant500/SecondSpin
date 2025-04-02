const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
    comment: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    replies: [replySchema] // Array of reply documents
});

module.exports = mongoose.model("Review", reviewSchema);