const express = require("express");
const bodyParser = require("body-parser");

let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/",function(req,res) {
    req.sendFile(__dirname+"/public/index.html");
})

app.post("/",function(req, res) {
    req.on("data", function(data) {
        console.log(JSON.parse(data));
    })
    res.send("done!")
    // res.sendFile(__dirname+"/public/resubmit.html")
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Server running on port 3000...");
})

