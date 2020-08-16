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
    $(".staffing-report").empty();
    let xhttp = new XMLHttpRequest();

    xhttp.addEventListener("load", reqListener)

    let date = $("#selectDate").val();

    xhttp.open("POST","/staffingreport")
    xhttp.setRequestHeader('Content-Type', 'application/json charset=UTF-8');
    xhttp.send(JSON.stringify(date));
}

function reqListener() {
    //Called with json of staffing report from server for a day
    //creates divs for each provier type to show staffing level
    let staffingReport = JSON.parse(this.responseText);

    $(".staffing-report").append("<div class='row staffing-row'></div>")

    //MLT
    let mltPercent = (staffingReport["MLT"][1]/staffingReport["MLT"][0])*100;
    let mltColor = determineColor(mltPercent);
    createBars("MLT", mltPercent, mltColor, staffingReport["MLT"]);

    //MD
    let mdPercent = (staffingReport["MD"][1]/staffingReport["MD"][0])*100;
    let mdColor = determineColor(mdPercent);
    createBars("MD", mdPercent, mdColor, staffingReport["MD"]);

    //PhD
    let phdPercent = (staffingReport["PhD"][1]/staffingReport["PhD"][0])*100;
    let phdColor = determineColor(phdPercent);
    createBars("PhD", phdPercent, phdColor, staffingReport["PhD"]);

    //RN
    let rnPercent = (staffingReport["RN"][1]/staffingReport["RN"][0])*100;
    let rnColor = determineColor(rnPercent);
    createBars("RN", rnPercent, rnColor, staffingReport["RN"]);

    //MHW Asst
    let mhwasstmaPercent = (staffingReport["MHW Asst/MA"][1]/staffingReport["MHW Asst/MA"][0])*100;
    let mhwasstmaColor = determineColor(mhwasstmaPercent);
    createBars("AsstMA", mhwasstmaPercent, mhwasstmaColor, staffingReport["MHW Asst/MA"]);

}

function determineColor(percent) {
    if (percent < 50) {
        return "red";
    } else if (percent < 70) {
        return "orange";
    } else {
        return "green"
    }
}

function createBars(providerType, percent, color, staffReportList) {
    $(".staffing-row").append(`<div class='${providerType}-div col staffing-div'><p>${providerType}</p></div>`);
    $(`.${providerType}-div`).append(`<div class='total-${providerType}-staff total-staff-div'></div>`);
    $(`.${providerType}-div`).append(`<div class='${providerType}-staffing-level staffing-percent-div'>${staffReportList[1]}/${staffReportList[0]}</div>`);
    $(`.${providerType}-staffing-level`).css({"height":`${percent}%`, "background-color":`${color}`, "bottom":`${percent}%`});

} 