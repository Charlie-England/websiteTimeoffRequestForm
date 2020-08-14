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
        let listOfDates = modifyToListOfDates(data);
        storeDates(listOfDates);
        sendRequestEmail(data);
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
            // pass: getEmailPassword()
            pass: process.env.GMAIL_PASSWORD
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

function getEmailPassword() {
    //reaches out to the pswd json and gets email password
    fs.readFile("api_pswds.json", (err, data) => {
        if (err) { 
            throw err;
        } else {
            let passwordFile = JSON.parse(data);
            return passwordFile.emailPassword
        }
    })
}


function modifyToListOfDates(timeOffRequest) {
    timeOffRequest = JSON.parse(timeOffRequest);
    let leaveStart = timeOffRequest.leaveStart;
    let leaveEnd = timeOffRequest.leaveEnd;
    let modifiedDateList = []

    if (leaveStart == leaveEnd) {
        let moddedRequest = {
            date: leaveStart,
            name: `${timeOffRequest.firstName} ${timeOffRequest.lastName}`,
            providerType: timeOffRequest.providerType,
            leaveTypes: timeOffRequest.leaveTypes,
            comments: timeOffRequest.comments
        }
        modifiedDateList.push(moddedRequest);
        
    } else {
        let listOfDates = getRangeOfDates(leaveStart, leaveEnd);
        for (let i = 0; i < listOfDates.length; i++) {
            let selectedDate = listOfDates[i];

            let moddedRequest = {
                date: selectedDate,
                name: `${timeOffRequest.firstName} ${timeOffRequest.lastName}`,
                providerType: timeOffRequest.providerType,
                leaveTypes: timeOffRequest.leaveTypes,
                comments: timeOffRequest.comments
            }

            modifiedDateList.push(moddedRequest);

        }
    }

    return modifiedDateList;
}


function storeDates(dateList) {
    fs.readFile("requests.json", "utf8", function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let currentFile = JSON.parse(data);

            for (let i = 0; i < dateList.length; i++) {
                let dateCurrent = dateList[i].date;

                try {
                    currentFile[dateCurrent];
                    currentFile[dateCurrent].push(dateList[i]);
                } catch {
                    currentFile[dateCurrent] = []
                    currentFile[dateCurrent].push(dateList[i])

                    console.log(`Date ${dateCurrent} not found, created new date`)
                }
            }

            let updatedFile = JSON.stringify(currentFile);
                
            fs.writeFile("requests.json", updatedFile, "utf8", (err, jsonString) => {

                if (err) {
                    console.log("File read failed:", err)
                    return
                }
                console.log("Completed Write")
            });
        }
    }
)}

function getRangeOfDates(firstDate, lastDate) {
    let firstDateClass = new Date(firstDate);
    let lastDateClass = new Date(lastDate);
    const oneDay = 24 * 60 * 60 * 1000;
    let datesReturnList = [];

    let diffDays = Math.round(Math.abs((firstDateClass-lastDateClass) / oneDay))

    for (let i =0; i <= diffDays; i++) {
        let dateToPush = new Date()
        dateToPush.setDate(firstDateClass.getDate() + (i+1));

        let day = dateToPush.getDay();
        if (day != "0" && day != "6") {
    
            let dateDay = dateToPush.getDate();
            if (dateDay.length < 2) {
                dateDay = `0${dateDay}`;
            }

            let month = dateToPush.getMonth() + 1;
            if (month.toString().length < 2) {
                month = `0${month}`;
            }
            let dateString = `${dateToPush.getFullYear()}-${month}-${dateDay}`
            datesReturnList.push(dateString);
        }
    }
    
    return datesReturnList;

}