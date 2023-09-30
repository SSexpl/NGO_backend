const mongoose= require('mongoose');
const eventSchema= new mongoose.Schema({
    name:String,
    details:String,
    location:String,
    date:String,
    participants:Number
 });
// define schema 
module.exports=mongoose.model("events",eventSchema); //export the model to be used where ever needed


