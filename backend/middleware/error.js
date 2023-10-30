const ErrorHandler  = require("../utils/errorhandler")

// res.send() is used to send the data in the string format 
// res.json() is also used to send the data but the data i sent in the json object format


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500 ;
    err.message = err.message || "Internal Sever Error";

    // wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    //mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400);
    }

    //Wrong JWT error 
    if(err.name === 'JsonWebTokenError'){
        const message = `JSON Web Token is invalid, Try again`;
        err = new ErrorHandler(message,400);
    }

    // JWT Expire Error 
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is Expired, Try again`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message,
    });
};

