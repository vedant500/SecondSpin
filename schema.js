const Joi = require("joi");

module.exports.listingSchema = Joi.object({

listing: Joi.object({

title: Joi.string().required(),

description: Joi.string().required(),

price: Joi.number().required().min(0),

image: Joi.string().required(),


contact: Joi.string()
            .pattern(/^[6-9]\d{9}$/) // Ensures exactly 10 digits for phone numbers
            .required()
            .messages({
                "string.pattern.base": "Contact must be a valid 10-digit number",
            }),

collage: Joi.string().required()

}).required(),

});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
})

module.exports.replySchema = Joi.object({
    reply: Joi.object({
      comment: Joi.string().required(),
    }).required(),
  });
  

// const Joi = require("joi");

// module.exports.listingSchema = Joi.object({
//     listing: Joi.object({
//         title: Joi.string().required().messages({ "any.required": "Title is required" }),
//         description: Joi.string().required().messages({ "any.required": "Description is required" }),
//         price: Joi.number().required().min(0).messages({
//             "any.required": "Price is required",
//             "number.min": "Price must be at least 0"
//         }),
//         image: Joi.string().required().messages({ "any.required": "Image is required" }),
//         contact: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
//             "any.required": "Contact number is required",
//             "string.pattern.base": "Contact number must be a 10-digit Indian number starting with 6, 7, 8, or 9"
//         }),
//         collage: Joi.string().required().messages({ "any.required": "College name is required" })
//     }).required()

// });
