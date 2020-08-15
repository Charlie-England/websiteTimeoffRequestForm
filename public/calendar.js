updateCalendarMins()

$("#selectDate").change(function() {
    console.log("hey")
})



function updateCalendarMins() {
    //goes through the calendars and updates the minimum and maximum allowed values
    let calendar = document.querySelector("#selectDate");
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
    
    calendar.setAttribute("min", today);
    calendar.setAttribute("max", maxDate);
}