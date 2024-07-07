const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/dbConfig.js");
const fileUpload = require("express-fileupload");
const cors = require('cors');
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json({limit:'5000kb'}))

// Enable files upload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

const userRoute = require('./routes/userRoute.js')
const videoRoute = require("./routes/videoRoute.js");
app.use(express.json());
// const doctorRoute = require("./routes/doctorsRoute");

app.use('/api/user',userRoute)
app.use("/api/video", videoRoute);
// app.use("/api/doctor", doctorRoute);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Node Express Server Started at ${port}!`));
