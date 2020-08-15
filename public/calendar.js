updateCalendarMins()

$("#selectDate").change(function() {
    staffingReportMain()
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

function staffingReportMain() {
    let xhttp = new XMLHttpRequest();

    xhttp.addEventListener("load", reqListener)

    let date = $("#selectDate").val();

    xhttp.open("POST","/staffingreport")
    xhttp.setRequestHeader('Content-Type', 'application/json charset=UTF-8');
    xhttp.send(JSON.stringify(date));
}

function reqListener() {
    let staffingReport = JSON.parse(this.responseText);
    console.log(staffingReport)

    $(".staffing-report").append(`<p>MLT: ${staffingReport["MLT"][0]}/${staffingReport["MLT"][1]}</p>`);
    $(".staffing-report").append(`<p>MD: ${staffingReport["MD"][0]}/${staffingReport["MD"][1]}</p>`);
    $(".staffing-report").append(`<p>PhD: ${staffingReport["PhD"][0]}/${staffingReport["PhD"][1]}</p>`);
    $(".staffing-report").append(`<p>MHW Asst/MA: ${staffingReport["MHW Asst/MA"][0]}/${staffingReport["MHW Asst/MA"][1]}</p>`);
    $(".staffing-report").append(`<p>RN: ${staffingReport["RN"][0]}/${staffingReport["RN"][1]}</p>`);

}