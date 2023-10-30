// created a general error handler 
// this class extends the Error class of node

class ErrorHandler extends Error{
    // we need to mention the message and error code whenever we want to throw some error
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        // this returns a string representing the point in the code at which error.captureStackTrace(obj) was called
        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHandler ;