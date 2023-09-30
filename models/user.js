const mongoose= require('mongoose');
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    phone:String,
    city:String,
    country:String,
    date:Date,
    password:String,
    gender:String,
    Imurl:String
 });
// define schema 
module.exports=mongoose.model("users",userSchema); //export the model to be used where ever needed


