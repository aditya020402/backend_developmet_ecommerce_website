const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a new user 
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatar",
        width:150,
        crop:"scale",
    });

    const {name,email,password} = req.body;
    
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        }
    });

    sendToken(user,201,res);

});

// login the existing user

exports.loginUser = catchAsyncErrors(async(req,res,next)=>{

    const {email,password} = req.body;

    //checking if user has given both password and email both 

    if(!email || !password)
    {
        return next(new ErrorHandler("Please enter Email and Password",400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password",401));
    }

    // this token generated during the time of login is the jwt token that is stored as the cookie 
    // in the browser of the user

    sendToken(user,200,res);
});



//logout user 

exports.logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });
    res.status(200).json({
        success:true,
        message:"Logged Out",
    });
});


// Forgot Password


exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});
     
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    // get reset password token 

    const resetToken = user.getResetPasswordToken();

    // saving the user to save the token of the user that was generated

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://localhost:3000/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    try{    
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success:true,
            message:`Email was sent to ${user.email} successfully`,
        });

    }
    catch(error){
        // if their is some kind of error we would remove the token that was generated and also 
        // make the expire time of the token to be the current time.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
});



//reset password 

exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    // create token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user)
    {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired")),400
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    // once we get the new password to make the update 
    // we would reset the password and remove the token that we had generated earlier 
    // and also we would make the token expire for the user then we would save the user.

    user.password=req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);

});



// get user details 
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    });
});



// update user password 

exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));
    }

    const result = req.body.newPassword !==req.body.confirmPassword;

    if(result){
        return next(new ErrorHandler("passwords does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
})

// get all user(admin)

exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users,
    });
});

// get single user (admin)

exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exists with id: ${req.params.id}`,404));
    }

    res.status(200).json({
        success:true,
        user,
    });
});




// update user roles 

exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
    })

})

// update user profile 

exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    };

    if(req.body.avatar!==""){
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatar",
            width:150,
            crop:"scale",
        });
        newUserData.avatar = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
    });

});



// delete user (admin)


exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not exists with the id: ${req.params.id}`,400));
    }

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully",
    })

})