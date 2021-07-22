const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const port = 5000;
const app = express();

//MiddleWare
app.use(express.json());
app.use(cors());

// MongoDB
const dbURI = require("./config/config").dbURI;
mongoose.connect(dbURI, { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
    }, function(err, desc){
    if(err)
        console.log("Couldn't connect to mongoDB")
    else
        console.log("MongoDB connected");
});
//Routes

const applicantRoute = require('./routes/applicant');
const recruiterRoute = require("./routes/recruiter");
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
app.use("/register", registerRoute);
app.use("/", loginRoute);
app.use("/applicant", applicantRoute);
app.use("/recruiter", recruiterRoute);


app.listen(port, ()=> console.log(`Server started at port ${port}`));