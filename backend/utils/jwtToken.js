//  CREATE THE TOKEN AND SAVE THE TOKEN IN THE COOKIE 

const sendToken = (user,statusCode,res) => {
    // user getJWTToken() is the function of the model all the objects of this table can invoke this function
    const token = user.getJWTToken();

    //options for cookie 
    //setting the expire of the cookie
    //setting the protocol with which it would work

    const options = {
        expires : new Date(
            Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000
        ),
        httpOnly:true,
    };

    // the .cookie function is used to set the cookie name to value 
    // res.cookie(name,value,options)  
    
    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,
        token,
    });
    
};


module.exports = sendToken ;