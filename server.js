const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/",function(req,res) {
    req.sendFile(__dirname+"/public/index.html");
})

app.post("/",function(req, res) {
    req.on("data", function(data) {
        storeData(data);
        // sendRequestEmail(data);
        console.log(JSON.parse(data));
    })
    res.send("done!")
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Server running on port 3000...");
})

function sendRequestEmail(data) {
    let parsedData = JSON.parse(data);

    let transporter = nodemailer.createTransport({
        service: "gmail", 
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

function storeData(newData) {
    fs.readFile("requests.json", "utf8", function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let currentFile = JSON.parse(data);
            newData = JSON.parse(newData);
            currentFile.table.push(newData);

            updatedFile = JSON.stringify(currentFile)

            fs.writeFile("requests.json", updatedFile, "utf8", (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err)
                    return
                }
                console.log("Completed Write")
            });
        }
    })
}