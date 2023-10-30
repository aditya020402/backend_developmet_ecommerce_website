const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Product Name"],
        trim:true,
    },
    description:{
        type:String,
        require:[true,"Please enter the product Description"],
    },
    price:{
        type:Number,
        required:[true,"Please Enter the Product Price"],
        maxLength:[8,"Price cannot exceed 8 characters"],
    },
    ratings:{
        type:Number,
        default:0,
    },
    images:[
        {
            public_id:{
                type:String,
                required:true,
            },
            url:{
                type:String,
                required:true,
            },
        },
    ],
    category:{
        type:String,
        required:[true,"Please Enter Product Category"],
    },
    Stock:{
        type:Number,
        required:[true,"Please Enter the Product Stock"],
        maxLength:[4,"stock cannot exceed 4 characters"],
        default:1
    },
    numofReviews:{
        type:Number,
        default:0,
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            },
        },
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

// we have created the schema now we would export the schema and import that in the controller

module.exports = mongoose.model("Product",productSchema);