const mongoose= require('mongoose');
const eventlistSchema= new mongoose.Schema({
   event_id:"String",
   user_id:"String",
   user_name:"String",
   user_phone:"String",
   user_email:"String",
   event_name:"String"
   
    });
// define schema 
module.exports=mongoose.model("eventlist",eventlistSchema); //export the model to be used where ever needed

// used to store the events of a user he he ....
