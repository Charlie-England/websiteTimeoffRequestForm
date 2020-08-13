const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/",function(req,res) {
    req.sendFile(__dirname+"/public/index.html");
})

app.post("/",function(req, res) {
    req.on("data", function(data) {
        sendRequestEmail(data);
        console.log(JSON.parse(data));
    })
    res.send("done!")
    // res.sendFile(__dirname+"/public/resubmit.html")
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Server running on port 3000...");
})

function sendRequestEmail(data) {
    let parsedData = JSON.parse(data);

    let transporter = nodemailer.createTransport({
        service: "email", 
        auth: {
            user: "facmhwtimeoffrequestfunneler@gmail.com",
            pass: '766dkfJJu2#'
        }
    });

    let mailOptions = {
        from: "facmhwtimeoffrequestfunneler@gmail.com",
        to: "facbhsvac@kp.org",
        subject: "test",
        text: `${parsedData}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    })
}