const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { resolve } = require("path");
const mongoose = require("mongoose");
const { StringDecoder } = require("string_decoder");

const dayOffSchema = new mongoose.Schema({
    status: String,
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
    providerType: String,
    schedule: { //day: [working true/false, hours worked]
        mondayWorking:Boolean,
        mondayHours:Number,

        tuesdayWorking:Boolean,
        tuesdayHours:Number,

        wednesdayWorking:Boolean,
        wednesdayHours:Number,

        thursdayWorking:Boolean,
        thursdayHours:Number,

        fridayWorking:Boolean,
        fridayHours:Number
    },
    scheduleWeek2: {
        referenceWeek: String,

        mondayWorking:Boolean,
        mondayHours:Number,

        tuesdayWorking:Boolean,
        tuesdayHours:Number,

        wednesdayWorking:Boolean,
        wednesdayHours:Number,

        thursdayWorking:Boolean,
        thursdayHours:Number,

        fridayWorking:Boolean,
        fridayHours:Number
    },
    daysOff:[dayOffSchema]
});

const Employee = mongoose.model('Employee', employeeSchema);
const DayOff = mongoose.model("DayOff", dayOffSchema);

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get("/",function(req,res) {
    const errorMessage = "";

    res.render('landing', {errorMessage:errorMessage});
});

app.get("/error", function(req, res) {
    const errorMessage = "Unable to find NUID, please try again";

    res.render('landing', {errorMessage:errorMessage});
})

app.post("/Time-Off-Request", function(req, res) {
    const nuid = req.body.nuid;
    res.redirect("/"+nuid);
});

app.get("/:paramName", function(req, res) {
    const nuid = req.params.paramName;
    mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});

    Employee.findOne({"_id":nuid}, function(err, employee) {
        if (err) {
            console.log(err);
            //route back to landing with error
            res.redirect("/error");
        } else if (employee===null) {
            res.redirect("/error");
        } else {
            res.render("requestform",{
                firstName:employee.firstName, 
                lastName:employee.lastName,
                providerType:employee.providerType,
                nuid:nuid
            });
            mongoose.connection.close();
        }
    });
});

app.get("/viewRequests/:paramName", function(req, res) {
    mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});

    Employee.findOne({"_id":req.params.paramName},function(err, employee) {
        if (err) {
            console.log(err)
        } else {
            res.render("requests", {
                firstName:employee.firstName,
                lastName:employee.lastName,
                nuid:employee._id,
                requestList:employee.daysOff
            });
            mongoose.connection.close();
        }
    });
});

app.get("/admin/A058859/:paramName", function(req, res) {
    mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});
    let employeeNames = [];
    let requestedTimes = [];
    let nuid = req.params.paramName;

    Employee.find(function(err,employees) {
        employees.forEach(employee => {
            let name = employee.firstName + " " + employee.lastName;
            employeeNames.push({name:name,nuid:employee._id});

            if (nuid === "all") {
                employee.daysOff.forEach(requestTimeOff => {
                    if (requestTimeOff.status === "Requested") {
                        requestedTimes.push(requestTimeOff);
                    }
                });
            } else if (nuid === employee._id) {
                employee.daysOff.forEach(requestTimeOff => {
                    requestedTimes.push(requestTimeOff);
                });
            }
        });
        res.render("adminview", {curEmpInfo:employeeNames,requestedTimes:requestedTimes});
        mongoose.connection.close();
    });
});

app.post("/admin/A058859/all",function(req,res) {
    const nuid = req.body.employees;
    const route = "/admin/A058859/"+nuid;
    
    res.redirect(route);
})

app.post("/:paramName",function(req, res) {
    req.on("data", function(data) {
        console.log(req.params.paramName);
        storeTimeOff(data, req.params.paramName);
        // sendRequestEmail(data);
    });
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

function storeTimeOff(timeOffData, nuid) {
    /* sent timeOffData {
        firstName: string
        lastName: string
        providerType: string
        leavestart: string
        leaveEnd: string
        returnDate: string
        leaveTypes: [string]
        comments: string
    }
    */

    timeOffData = JSON.parse(timeOffData);
    let leaveTypesString = timeOffData.leaveTypes.join("/");

    const newTimeOffRequest = new DayOff({
        status: "Requested",
        startDate: timeOffData.leaveStart,
        endDate: timeOffData.leaveEnd,
        returnDate: timeOffData.returnDate,
        typeOfLeave: leaveTypesString,
        comments: timeOffData.comments
    });

    //Add to _id in mongoose
    mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});

    Employee.updateOne({"_id":nuid},{$push:{daysOff:newTimeOffRequest}},(err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Employee: "+nuid+" time off request added successfully");
            mongoose.connection.close();
        }
    });
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

