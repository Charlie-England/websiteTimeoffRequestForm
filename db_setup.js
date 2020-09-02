const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { resolve } = require("path");
const mongoose = require("mongoose");
const { NONAME } = require("dns");

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
    providerType: String,
    access: String,
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


mongoose.connect("mongodb://localhost:27017/mhwtimeoffDB", {useNewUrlParser: true});

let employees = [];
addEmployeeModels();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    employees.forEach(employee => {
        employee.save();
    })


});


function addEmployeeModels() {

    // const empExample = new Employee ({
    //     _id:"",
    //     firstName:"",
    //     lastName:"",
    //     providerType:"",
    //     schedule: {
    //         mondayWorking:true,
    //         mondayHours:,

    //         tuesdayWorking:true,
    //         tuesdayHours:,

    //         wednesdayWorking:true,
    //         wednesdayHours:,

    //         thursdayWorking:true,
    //         thursdayHours:,

    //         fridayWorking:true,
    //         fridayHours:,
    //     },
    //     daysOff: []
    // });
    // employees.push();

    const charlieE = new Employee ({
        _id:"A058859",
        firstName:"Charlie",
        lastName:"England",
        providerType:"Admin",
        access: "admin",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(charlieE);

    const susanM = new Employee ({
        _id:"M935044",
        firstName:"Susan",
        lastName:"Miller",
        providerType: "MLT",
        access: "none",
        schedule: {
            mondayWorking:false,
            mondayHours:0,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(susanM);

    const jodyD = new Employee ({
        _id:"P239996",
        firstName:"Jody",
        lastName:"Dearborn",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:false,
            mondayHours:0,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:false,
            thursdayHours:0,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(jodyD);

    const brendaA = new Employee ({
        _id:"K200995",
        firstName:"Brenda",
        lastName:"Arzillo",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:false,
            tuesdayHours:0,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(brendaA);

    const mikeM = new Employee ({
        _id:"O0716459",
        firstName:"Mike",
        lastName:"Marletto",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:false,
            fridayHours:0,
        },
        daysOff: []
    });
    employees.push(mikeM);

    const MargaretP = new Employee ({
        _id:"A599174",
        firstName:"Margaret",
        lastName:"Pleasant",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:false,
            fridayHours:0,
        },
        daysOff: []
    });
    employees.push(MargaretP);

    const ianK = new Employee ({
        _id:"I693633",
        firstName:"Ian",
        lastName:"Krauter",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(ianK);

    const jarimL = new Employee ({
        _id:"D800276",
        firstName:"Jarim",
        lastName:"Lee",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(jarimL);

    const lynetteT = new Employee ({
        _id:"Y486374",
        firstName:"Lynette",
        lastName:"Thorlakson",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(lynetteT);

    const cherylP = new Employee ({
        _id:"H715507",
        firstName:"Cheryl",
        lastName:"Poynor",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:false,
            mondayHours:0,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(cherylP);

    const jenniferW = new Employee ({
        _id:"Y992143",
        firstName:"Jennifer",
        lastName:"Watanabe",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(jenniferW);

    const katrinaL = new Employee ({
        _id:"I511489",
        firstName:"Katrina",
        lastName:"Lindauer",
        providerType:"MLT",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        scheduleWeek2: {
            referenceWeek: "6/21/20",

            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:false,
            fridayHours:0,
        },
        daysOff: []
    });
    employees.push(katrinaL);

    const reenaG = new Employee ({
        _id:"H398283",
        firstName:"Reena",
        lastName:"Grewal",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:false,
            tuesdayHours:0,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        scheduleWeek2: {
            referenceWeek: "6/14/20",

            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:false,
            fridayHours:0,
        },
        daysOff: []
    });
    employees.push(reenaG);

    const olgaG = new Employee ({
        _id:"A777819",
        firstName:"Olga",
        lastName:"Godina",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:false,
            fridayHours:0,
        },
        scheduleWeek2: {
            referenceWeek: "6/14/20",

            mondayWorking:false,
            mondayHours:0,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(olgaG);

    const ericG = new Employee ({
        _id:"K647965",
        firstName:"Eric",
        lastName:"Greenman",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(ericG);

    const jacksonB = new Employee ({
        _id:"P531884",
        firstName:"Jackson",
        lastName:"Brammer",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(jacksonB);

    const ellaM = new Employee ({
        _id:"K194257",
        firstName:"Ella",
        lastName:"Miropolskiy",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:false,
            tuesdayHours:0,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(ellaM);

    const ashokSK = new Employee ({
        _id:"G556638",
        firstName:"Ashok",
        lastName:"Shimoji-Krishnan",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(ashokSK);

    const mabelB = new Employee ({
        _id:"T117665",
        firstName:"Mabel",
        lastName:"Bongmba",
        providerType:"MD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(mabelB);

    //RN
    const mariM = new Employee ({
        _id:"I643265",
        firstName:"Mari",
        lastName:"McFadden",
        providerType:"RN",
        access:"none",
        schedule: {
            mondayWorking:false,
            mondayHours:0,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(mariM);

    const crystalS = new Employee ({
        _id:"X062763",
        firstName:"Crystal",
        lastName:"Skelton",
        providerType:"RN",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:9,

            tuesdayWorking:true,
            tuesdayHours:9,

            wednesdayWorking:true,
            wednesdayHours:9,

            thursdayWorking:true,
            thursdayHours:9,

            fridayWorking:false,
            fridayHours:0,
        },
        daysOff: []
    });
    employees.push(crystalS);

    //MHW Asst
    const paytonJ = new Employee ({
        _id:"B006158",
        firstName:"Payton",
        lastName:"Jones",
        providerType:"MHW Asst",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(paytonJ);

    //PhD
    const joannaS = new Employee ({
        _id:"C799457",
        firstName:"Joanna",
        lastName:"Stagg",
        providerType:"PhD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(joannaS);

    const samJ = new Employee ({
        _id:"D646037",
        firstName:"Samantha",
        lastName:"Jimenez",
        providerType:"PhD",
        access:"none",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:false,
            tuesdayHours:0,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(samJ);

    const jeffV = new Employee ({
        _id:"D248424",
        firstName:"Jeffrey",
        lastName:"Vannice",
        providerType:"PhD",
        access:"admin",
        schedule: {
            mondayWorking:true,
            mondayHours:8,

            tuesdayWorking:true,
            tuesdayHours:8,

            wednesdayWorking:true,
            wednesdayHours:8,

            thursdayWorking:true,
            thursdayHours:8,

            fridayWorking:true,
            fridayHours:8,
        },
        daysOff: []
    });
    employees.push(jeffV);
    
    mongoose.connection.close();
}