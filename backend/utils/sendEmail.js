//using node nodemailer module to send the mails
const nodeMailer = require("nodemailer");

// for sending the mail we would need an id and its password
// for sending the mail we just need to modify the mail options where 
// we need to mention the following parameters that are the from , to , subject , text(message) that we need to send


const sendEmail = async(options)=>{
    
    // setting up the transpoter to send the mail 
    const transporter = nodeMailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        service:process.env.SMTP_SERVICE,
        secure:false,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
        },
    });

    // setting the mail options of the receiver 
    const mailOptions = {
        from:process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    };

    // sending the mail to the user requesting forgot password mail
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
