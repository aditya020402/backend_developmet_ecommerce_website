const express = require('express');
const cookieParser = require("cookie-parser");
const app = express(); 
const errorMiddleware = require("./middleware/error");
const fileUpload= require("express-fileupload");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

if(process.env.NODE_ENV !== "PRODUCTION"){
    dotenv.config({ path: 'backend/config/config.env' })
}

//middleware are the functions that have access to the request object and the response object and the next function in the application response and request cycle
// the next function is a function in the express router that when invoked executes the middleware succeeding the current middleware

// it parses the incoming json payloads and is based on body parser with this the payload won't be treated as objects
app.use(express.json())
// cookie parser parses the cookie attached to the client request object res.clearcookie(cookiename) function is used to remove the cookie
app.use(cookieParser())
// parses the req.body property it has the following parsers 
// json body parser, raw body parser , text body parser , url encoded body parser

app.use(bodyParser.urlencoded({extended:true}))

// middleware used to upload file . the files is assesible from req.files which is array 
app.use(fileUpload())

// route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");


app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);


//uncomment during the time of production build
// app.use(express.static(path.join(__dirname,"../frontend/build")));
// app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"));
// })


// middleware for errors
app.use(errorMiddleware);

module.exports = app;