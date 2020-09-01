const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { resolve } = require("path");
const mongoose = require("mongoose");
const { StringDecoder } = require("string_decoder");

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/",function(req,res) {
    mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        const dayOffSchema = new mongoose.Schema({
            startDate: String,
            endDate: String,
            returnDate: String,
            typeOfLeave: String,
            comments: String
        });

        const employeeSchema = new mongoose.Schema({
            _id: String,
            firstName: String,
            lastName: String,
            schedule: { //day: [working true/false, hours worked]
                monday:[Boolean,Number], 
                tuesday:[Boolean,Number],
                wednesday:[Boolean,Number],
                thursday:[Boolean,Number],
                friday:[Boolean,Number]
            },
            daysOff:[dayOffSchema]
        });
    });

    const Employee = mongoose.model('Employee', employeeSchema);

    const employee1 = new Employee({
        _id: "A058859",
        firstName: "Charlie",
        lastName: "England",
        schedule: {
            monday:[true,8],
            tuesday:[true,8],
            wednesday:[true,8],
            thursday:[true,8],
            friday:[true,8]
        }
    });

    employee1.save();
    console.log("employee 1 saved");

    res.sendFile(__dirname+"/public/index.html");

});

app.post("/",function(req, res) {
    req.on("data", function(data) {
        let listOfDates = modifyToListOfDates(data);
        storeDates(listOfDates);
        sendRequestEmail(data);
    })
    res.send("done!")
});

app.post("/staffingreport", function(req, res) {
    let staffingReport = {}
    req.on("data", function(data) {
        let date = JSON.parse(data);
        //takes a date and gets the current staffing levels for:
        //MLT, MD, PHD, MHW Asst/MA, RN
        //returns an object with levels
        let returnStaffingReport = {
            "MLT":[],
            "MD":[],
            "PhD":[],
            "MHW Asst/MA":[],
            "RN":[]
        }

        //get staffing level from json
        fs.readFile("staffing.json", "utf8", function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                let staffingLevels = JSON.parse(data);

                let dateClass = new Date(date);
                day = dateClass.getDay()

                if (day != 0 && day != 6) {
                    let dayStaffing = staffingLevels.StaffingLevels[day];

                    returnStaffingReport["MLT"].push(dayStaffing["MLT"]);
                    returnStaffingReport["MLT"].push(dayStaffing["MLT"]);
                    returnStaffingReport["MD"].push(dayStaffing["MD"]);
                    returnStaffingReport["MD"].push(dayStaffing["MD"]);
                    returnStaffingReport["PhD"].push(dayStaffing["PhD"]);
                    returnStaffingReport["PhD"].push(dayStaffing["PhD"]);
                    returnStaffingReport["MHW Asst/MA"].push(dayStaffing["MHW Asst/MA"]);
                    returnStaffingReport["MHW Asst/MA"].push(dayStaffing["MHW Asst/MA"]);
                    returnStaffingReport["RN"].push(dayStaffing["RN"]);
                    returnStaffingReport["RN"].push(dayStaffing["RN"]);
                }

                fs.readFile("requests.json", "utf8", function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        let requestsData = JSON.parse(data);
                        let dateRequests = requestsData[date];
            
                        try {
                            for (let i = 0; i < dateRequests.length; i++) {
                                let providerType = dateRequests[i].providerType;
                                returnStaffingReport[providerType][1]--;
                            }
                        } catch {
                            console.log("date not in requests")
                        }
                        res.send(JSON.stringify(returnStaffingReport))
                    }
                })
            }
        })
    })
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Server running on port 3000...");
})



function sendRequestEmail(data) {
    let parsedData = JSON.parse(data);
    let mailOptionsText = getMailString(parsedData);

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
        subject: "FAC MHW Time Off Request",
        text: `${mailOptionsText}`
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

    let diffDays = Math.round(Math.abs((firstDateClass-lastDateClass) / oneDay));

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

function getMailString(parsedData) {
    let today = new Date();

    let todayString = today.toLocaleDateString("en-us");

    let dayNumAndStringObject = calcNumberOfDays(parsedData.leaveStart, parsedData.leaveEnd);

    let leaveTypesString = '';
    if (parsedData.leaveTypes.length === 1) {
        leaveTypesString = parsedData.leaveTypes
    } else {
        leaveTypesString = parsedData.leaveTypes.join("/");
    }

    let firstName = parsedData.firstName;
    let lastName = parsedData.lastName;

    let emailString = `Name: ${firstName} ${lastName}\n`;
    emailString += `Provider Type: ${parsedData.providerType}\n\n`;
    emailString += `Start Date: ${parsedData.leaveStart} -> End Date: ${parsedData.leaveEnd} || Return Date: ${parsedData.returnDate} \n\n`;
    emailString += `Requesting days: ${dayNumAndStringObject.daysStrings}\n\n`;
    emailString += "___________Admin Use________________\n";
    emailString += `____________________________________\n\n`;
    emailString += `${firstName} ${lastName} (${parsedData.providerType}) Off - (${leaveTypesString})\n\n`
    emailString += `Name: ${firstName} ${lastName} | Req Date: ${todayString} | Prov Type: ${parsedData.providerType} | Start:end: ${parsedData.leaveStart} -> ${parsedData.leaveEnd} | # of days: ${dayNumAndStringObject.numberOfDays} | ${parsedData.comments}\n`;
    

    console.log(emailString);
    

    return emailString
}

function calcNumberOfDays(start, end) {
    //convert start and end dates to Date objects
    //find difference
    //returns object {numberOfDays: #, daysStrings: ''}
    let returnObject = {};
    let startDate = parseDate(start);
    let endDate = parseDate(end);
    let curDate = startDate;

    if (start === end) {
        return {numberOfDays: "1", daysStrings: curDate.toLocaleDateString("en-us",{month:"short", weekday:"long", day:"numeric", year:"numeric"})};
    }

    const oneDay = 24 * 60 * 60 * 1000;
    let numDays = Math.round(Math.abs((startDate-endDate) / oneDay)) + 1;
    let dayList = [];
    let trueNumDays = 0;

    for (let i = 0; i < numDays; i++) {
        curDate.setDate(startDate.getDate() + 1);
        if (curDate.getDay() != "0" && curDate.getDay() != "6") {
            dayList.push(curDate.toLocaleDateString("en-us",{month:"short", weekday:"long", day:"numeric", year:"numeric"}));
            trueNumDays++;
        }
    }

    returnObject.numberOfDays = trueNumDays;
    returnObject.daysStrings = dayList.join(", ");
    return returnObject;
}

function parseDate(dateString) {
    let dateSplit = dateString.split("-");

    let year = dateSplit[0];
    let month = dateSplit[1];
    let day = dateSplit[2];

    month--;

    return new Date(year, month, day);
}

/*
RDO Schedule:
Monday: Cheryl (MLT), Jody (MLT), Olga (MD) EOW-9/21 off, Susan (MLT)
Tuesday: Brenda (MLT), Ella (MD), Sam (PhD), Reena (MD) EOW 9/29-Off
Thursday: Jackson (MD), Jody (MLT)
Friday: Margaret (MLT), Mike (MLT), Reena (MD) EOW-9/25 off, Katrina (MLT) EOW-10/2 off, Olga (MD) EOW-10/2 Off
*/

