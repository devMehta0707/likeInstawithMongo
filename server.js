require('dotenv').config();
require("./dbconnection");
const express = require('express');
const app = express();
const { errorHandler } = require('./middleware/errorHandler');
const port = process.env.PORT || 3000;
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(fileUpload());
app.use(morgan('combined'));
app.use('/',require('./routes/routes'))
app.use(errorHandler)

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})