const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");

//config 
dotenv.config({ path: 'backend/config/config.env' })


//the process object is an instace of the event emitter class 
// it has some pre defined events such as exit , uncaughtException,unhandledRejection
// 


//handling the uncaught exception 
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("shutting down the server due to uncaught exception");
    process.exit(1);
})

// connecting to the database
connectDatabase();

// setting up the server at the given port number
app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})

//configure cloudinary to store the photos 
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})


//Unhandled Promise Rejection 
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})


// process.on("exit",(code)=>{
//     console.log(`program was exited with the code ${code}`);
// });



// an error has three property . it has name , stack and message and code 
// now error object can be passed to a function and can be returned from a function 
// error can also be throw . in that case the error becomes a exception and it bubbles up the stack until it is caught somewhere . if it is not caught somewhere it becomes a uncaught exception which causes the application to crash 
