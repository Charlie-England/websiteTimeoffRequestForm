
const path = window.location.pathname;
const nuid = path.split("/")[3];

$("#"+nuid).attr('selected','selected');