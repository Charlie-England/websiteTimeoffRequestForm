//Update date fields to current date
//change minimum date of all to today

$(".clearForm").click(function() {
    clearForm();
})

$(".submit").click(function() {
    //Adds button functionality to Submit button
    let formInputs = gatherFormInputs();
    let formCompletionInfo = checkFormCompletion(formInputs);
    if(formCompletionInfo[0]) {
        modalUpdate(formInputs);
        $("#popUpContinue").modal("show");
    } else {
        missingInputString = formCompletionInfo[1].join("\n")
        missingInputFlash(formCompletionInfo[2]);
    }
});

$("#startDate").change(function() {
    reactDate("end");
    reactDate("return");
    updateDayLabel();
})

$("#endDate").change(function() {
    reactDate("return");
    updateDayLabel();
})

$("#returnDate").change(function() {
    updateDayLabel();
})

$(".send-final").click(function() {
    let xhttp = new XMLHttpRequest();
    let formInputs = gatherFormInputs();

    xhttp.open("POST","/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json charset=UTF-8');
    xhttp.send(JSON.stringify(formInputs));

    $("#popUpContinue").modal("hide");
    $("#completedModal").modal("show");
})


//Set minimum dates to current date
updateCalendarMins();


function reactDate(changeSpecific) {
    //takes the specific calendar to change (end or return)
    //Reacts to the dates inputted into start or end
    //if end, and if endDate does not have a value and compareLastStart is false
        //Will set endDate equal to start, else it leave it
    //if return, sets the return date to be 1 day past the endDate
    if (changeSpecific =="end") {
        if ($("#endDate").val() == "" || compareLastStart()) {
            let dateSet = getModifiedDate(0)
            $("#endDate").val(dateSet);
        }
    } else if (changeSpecific == "return") {
        let dateSet = getModifiedDate(1);
        $("#returnDate").val(dateSet);
    }
}

function checkFormCompletion(formInputs) {
    //checks the form to make sure it's completed, returns array
    //return [true/false, problem]
    let problemList = [];
    let problemListReference = [];
    let completionCheck = [true,problemList,problemListReference];
    if (!formInputs["firstName"]) {
        completionCheck[0] = false;
        completionCheck[1].push("First Name")
        completionCheck[2].push("firstNameLabel")
    }
    if (!formInputs["lastName"]) {
        completionCheck[0] = false;
        completionCheck[1].push("Last Name")
        completionCheck[2].push("lastNameLabel")
    }
    if (formInputs["leaveTypes"].length == 0) {
        completionCheck[0] = false;
        completionCheck[1].push("Leave Type");
        completionCheck[2].push("leaveTypesLabel");
    }
    if (formInputs["providerType"] == "null") {
        completionCheck[0] = false;
        completionCheck[1].push("Provider Type");
        completionCheck[2].push("provider-select");
    }
    return completionCheck;
}

function clearForm() {
    //Clear entire form, calls clear checkboxes to clear those as well
    document.querySelector("#firstName").value = "";
    document.querySelector("#lastName").value = "";
    $("#startDate").val("");
    $("#endDate").val("");
    $("#returnDate").val("");
    $(".startDateDay").text("");
    $(".endDateDay").text("");
    $(".returnDateDay").text("");
    $("#providerType").val("0");
    $("#comments").val("");

    clearCheckboxes();
}

function gatherFormInputs() {
    //Gathers all information that has been input into the form
    let formInputs = {
        "firstName":$("#firstName").val(),
        "lastName":$("#lastName").val(),
        "providerType":$("#providerType").val(),
        "leaveStart":$("#startDate").val(),
        "leaveEnd":$("#endDate").val(),
        "returnDate":$("#returnDate").val(),
        "leaveTypes":[],
        "comments":$("#comments").val(),
    }
    formInputs["leaveTypes"] = getLeaveTypes();
    formInputs = modifyProviderType(formInputs);

    return formInputs;
}

function getLeaveTypes() {
    //Iterates through all the leaveTypes checkboxes, if checked add to list
    //return list of id elements that were checked (ex: pto, cme)
    let leaveTypes = [];
    for (let i = 0; i < document.querySelectorAll(".leaveTypes").length; i++) {
        let idOfInput = "#" + document.querySelectorAll(".leaveTypes")[i].id;
        if ($(idOfInput).is(":checked")) {
            leaveTypes.push(`${idOfInput.split("#")[1]}`);
        }
    }
    return leaveTypes;
}

function clearCheckboxes() {
    //Clears all checkboxes
    for (let i = 0; i < document.querySelectorAll(".leaveTypes").length; i++) {
        let idOfInput = "#" + document.querySelectorAll(".leaveTypes")[i].id;
        if ($(idOfInput).is(":checked")) {
            $(idOfInput).prop('checked', false);
        }
    }
}

function getModifiedDate(modifier) {
    //takes a modifier (0 or 1), uses this to determine logic.
    //if 0, return same date (used for end date)

    //if 1, (used for return to work date
    //adds the modifier (generally 1) to the date
    //then checks if this falls on a saturday or sunday
    //adds more to the date to get it to Monday
    //returns the modified date for the calendar

    if (modifier == 0) {
        return $("#startDate").val();
        
    } else if (modifier == 1) {
        let endDate = $("#endDate").val();
        let finalDate = getDateObject(endDate);

        finalDate.setDate(finalDate.getDate() + modifier);//Add 1 day to date

        if (finalDate.getDay() == 0) {
            finalDate.setDate(finalDate.getDate() + 1);
        } else if (finalDate.getDay() == 6) {
            finalDate.setDate(finalDate.getDate() + 2);
        }

        let year = finalDate.getFullYear();
        let day = finalDate.getDate();
        let month = finalDate.getMonth()+1;
        if (month < 10) {
            month = "0" + `${month}`;
        }
        if (day < 10) {
            day = "0" + `${day}`;
        }

        return `${year}-${month}-${day}`;
        //return modified date for returnWork
    }
}



function updateDayLabel() {
    //Updates every label for the day of the week selected in calendar
    if ($("#startDate").val()) {
        let dayOfStart = getDateObject($("#startDate").val()).getDay();
        $(".startDateDay").text(daySwitchCase(dayOfStart));
    }
    if ($("#endDate").val()) {
        let dayOfEnd = getDateObject($("#endDate").val()).getDay();
        $(".endDateDay").text(daySwitchCase(dayOfEnd));

    }
    if ($("#returnDate").val()) {
        let dayOfReturn = getDateObject($("#returnDate").val()).getDay();
        $(".returnDateDay").text(daySwitchCase(dayOfReturn));

    }
}

function getDateObject(dateStringFromCalendar) {
    //takes a date in the form of "2020-07-30" and splits on -
    //creates a new date with this and returns it
    dateList = dateStringFromCalendar.split("-");
    dateObject = new Date(dateList[0],dateList[1]-1,dateList[2]);

    return dateObject;
}

function daySwitchCase(dayInt) {
    //takes the integer form of a day and returns the string value
    switch (dayInt) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}

function compareLastStart() {
    //Compares start and end dates if the end date is greater, it does not need to be udpated and returns false
    //if the end state is less (aka is before the last day) it needs to be updated
    let startDate = getDateObject($("#startDate").val());
    let endDate = getDateObject($("#endDate").val());

    if (endDate > startDate) {
        return false;
    } else {
        return true;
    }
}

function updateCalendarMins() {
    //goes through the calendars and updates the minimum and maximum allowed values
    let calendars = document.querySelectorAll(".calendarDates");
    let today = new Date();

    let year = today.getFullYear();
    let day = today.getDate();
    let month = today.getMonth()+1;
    if (month < 10) {
        month = "0" + `${month}`;
    }
    if (day < 10) {
        day = "0" + `${day}`;
    }

    today = `${year}-${month}-${day}`;
    maxDate = `${year+2}-${month}-${day}`;
    

    for (let i = 0; i < calendars.length; i++) {
        calendars[i].setAttribute("min", today);
        calendars[i].setAttribute("max", maxDate);
    }
}

function missingInputFlash(problemListReference) {
    //toggles flash for each missing input
    problemListReference.forEach(function(elementClass) {
        setTimeout(function() {
            addBackgroundFlash(elementClass) },
            200);
        setTimeout(function() {
            removeBackgroundFlash(elementClass) },
            400);
        setTimeout(function() {
            addBackgroundFlash(elementClass) },
            600);
        setTimeout(function() {
            removeBackgroundFlash(elementClass) },
            800);
        setTimeout(function() {
            addBackgroundFlash(elementClass) },
            1000);
        setTimeout(function() {
            removeBackgroundFlash(elementClass) },
            1200);
        
    })
}

function addBackgroundFlash(elementId) {
    $("." + elementId).addClass("flash-on");
}

function removeBackgroundFlash(elementId) {
    $("." + elementId).removeClass("flash-on");
}

function modalUpdate(formInput) {
    //Updates the modal div with the form information
    
    let firstName = formInput["firstName"];
    let lastName = formInput["lastName"];
    let providerType = formInput["providerType"];
    let leaveStart = formInput["leaveStart"];
    let leaveEnd = formInput["leaveEnd"];
    let returnDate = formInput["returnDate"];
    let leaveTypes = formInput["leaveTypes"].join(", ");
    let comments = formInput["comments"];

    leaveStart = getModalDate(leaveStart);
    leaveEnd = getModalDate(leaveEnd);
    returnDate = getModalDate(returnDate);

    let modalBodyName = `${firstName} ${lastName}, ${providerType}`;
    
    $(".modalStartDate").text(leaveStart);
    $(".modalEndDate").text(leaveEnd);
    $(".modalReturnDate").text(returnDate);
    $(".modalName").text(modalBodyName);
    $(".modalLeaveTypes").text(leaveTypes);
    $(".modalCommentsInput").text(comments);
}

function getModalDate(date) {
    //slices the date object int he form 2020-07-30 and returns M/D/Year in mm/dd/yy
    modifiedDate = `${date.slice(5,7)}/${date.slice(8,10)}/${date.slice(2,4)}`;
    return modifiedDate;
}

function modifyProviderType(formInputs) {
    //takes formInputs and modifies providerType to correlate to the value
    //returns this modified formInputs
    let providerNum = formInputs["providerType"];
    let providerString = "";

    switch (providerNum) {
        case "0":
            providerString = "null";
            break;
        case "1": 
            providerString = "MLT";
            break;
        case "2":
            providerString = "MD";
            break;
        case "3":
            providerString = "PhD";
            break;
        case "4":
            providerString = "MHW Asst/MA";
            break;
        case "5":
            providerString = "RN";
            break;
    }

    formInputs["providerType"] = providerString;
    return formInputs;
}