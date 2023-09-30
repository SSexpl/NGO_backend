const mongoose= require('mongoose');
require('dotenv').config();
const url=process.env.URL_DB;
mongoose.connect(url);//for establishing connection