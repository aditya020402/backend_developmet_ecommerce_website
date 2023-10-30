const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter you name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"],
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"],
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"password should be greater than 8 characters"],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    role:{
        type:String,
        default:"user",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    // the token field 
    resetPasswordToken:String,
    // time of expiry of the token.
    resetPasswordExpire:Date,
});

//this is a event and everytime before saving we would run this
//see here we have not used arrow function because we cannot use this inside
//arrow function therefore we have created normal function in here.


// Mongoose middleware function that hashes the password field of a user document before it's saved to the database but only if the password has been modified during the save operation

userSchema.pre("save",async function (next){
    // checks if the password is already hashed or not . if the password is already hashed we will not hash it again
    // however if the password is not hashed we need to hash it.
    // if the password field is not modified meaning the password
    // hasn't changed during this save operation the function immediately calls next() 
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})


// the userSchema.methods.somefunction  these are the function that can be called
// the object of the schema meaning the user that are present in side the table can call this function 


// jwt token 
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

// compare password (that is stored in the db and the one that the user is entering right now)

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

// generating password reset token (using this token we are going to reset the password) 
// concept used -> we are going to generate a token using crypto library then this token is going to be saved in the db 
// and the same token will be sent to the user.
// now the user will use this token to verify that it is him.

// so we will generate this token and save it with the user in the db and along with this 
// we will store the token expiry time and the token value 


userSchema.methods.getResetPasswordToken = function () {
    // generating token 
    const resetToken = crypto.randomBytes(20).toString("hex");
    //hashing and adding resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // how long the token will be valid for needs to be set
    this.resetPasswordExpire = Date.now()+15*60*1000;
    return resetToken;
};

module.exports = mongoose.model("User",userSchema);