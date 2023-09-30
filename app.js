const express=require('express');
const events = require('./models/events');
const Jwt=require('jsonwebtoken');
const JwtKey="hello_world";
require('./models/config');
const cors=require('cors');
const bodyParser=require('body-parser');
var app=express();
require('dotenv').config();
// middleware..
app.use(express.json());
app.use(cors());// without this req res cant be made over local host.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
//models...
const Event= require('./models/events');
const User=require('./models/user');
const EventList=require('./models/event_list');// stores the userid and the event id..
//const user = require('./models/user');
// gets all the events from the databse
app.get('/events',async(req,res)=>//async response function
{
  //console.log("i am up at 5000");
  try{
  const Events=await events.find();
  if(Events.length>0)
   res.send(Events);// response would be send.
  else
    res.send({result:"No event found"});
  }
  catch(err)
  {
    console.log(err);
  }
});
//user registration with all the details ........
app.post('/register',async(req,res)=>
{
   const reqobj=await req.body;
   // we will get the whole body for usage...;
   const current_date = new Date();
   const newUser={...reqobj,date:current_date};
   console.log("backend:");
   //console.log(newUser);
   const resp=await User.find({email:reqobj.email});
   if(resp.length>0)
   {
     const ob={state:"duplicate"};
     res.send(ob);
   }
   else
   {
    let added= new User(newUser);
    const ans=await  added.save();
    res.send({state:"success"});
   }
}
);
// signin the user 
app.post('/signup',async(req,res)=>
{
    const {email,password}=await req.body;
    const result=await User.find({email:email});
   // console.log("result " + result);
    if(result.length >0)
    {
       const resp=await User.find({email:email,password:password});
       
       if(resp.length>0) // user exisiting 
       {
         Jwt.sign({resp} ,JwtKey ,{expiresIn :"2h"} ,(err,token)=>{
          if(err)
          {
                res.send({state:"error"});
          }
          else
          {
               res.send({id:resp[0]._id,auth:token,state:"success"});
          }
         })
       }
       else
       {
        const ob={state:"fail"};
        res.send(ob);
       }
    }
    else
    {
      const ob={state:"noemail"};
       res.send(ob);
    }
});
// app.post('./eventRegister',async(req,res)=>
// {
//     const reqob=await req.body;
//     let added= new EventList(reqob);
//     const ans= await added.save();
//     if(ans)
//     {
//        res.send({state:"success"});
//     }
//     else
//     {
//        res.send({state:"failure"});
//     }
// });

// finds a particular users detail by his/her id
app.post("/user",async(req,res)=>
{
   let {id}=await req.body;
   id=id.substring(1,id.length-1);
 // console.log(req.body);
  // console.log(id +" "+typeof(id));
   const ans=await User.findById(id);
 // console.log(ans);
    if (ans)
  res.send(ans);
   else
   res.send ({state:"failure"});
  
});
// checks whether a user is registered for a particular event ........
app.post('/Checkevent',async(req,res)=>
{
    let{uid,evid}=req.body;
   // console.log(uid+ " "+evid);
    const ans=await EventList.find({user_id:uid,event_id:evid});
    if(ans.length>0)
    {
      res.send({state:true});
    }
    else
    {
      res.send({state:false});
    }
});
// 
app.post('/GeteventRegister',async(req,res)=> // to find what all events the current user has registered for.
{
    let {id}=await req.body;
    id=id.substring(1,id.length-1);
 // console.log(req.body);
   // console.log(id);
    const ans= await EventList.find({user_id:id});
    const events = [];

      // Loop through the IDs and find the details of each event
      const promises = ans.map(eventId => {
        return Event.findOne({ _id: eventId.event_id });
      });

      const results = await Promise.all(promises);

      // Push each event into the events array
      results.forEach(event => {
        events.push(event);
      });

      // Return the array of events as a response that the current user has registered for
      res.send(events);
});
//stores details when a user x registers for an event y here is how : 
app.post('/Eventstore',async(req,res)=>
{
   let{uid,evid,event_name,event_date}=req.body;
   const check=EventList.find({user_id:uid,event_id:evid});
   if(check.length>0)
   {
     res.send({state:"fail"});
   }
   else
   {
   const UDetails=await User.find({_id:uid});
   const UserDetails=UDetails[0];
 //  console.log(UserDetails);
   let added= new EventList({user_id:uid,event_id:evid,event_name,event_date,user_name:UserDetails.name,user_phone:UserDetails.phone,user_email:UserDetails.email});
    const ans=await  added.save();
    res.send({state:"success"});
   }
});
app.get('/admin/get-users',async(req,res)=>
{
   //console.log("i am up at 5000");
   const Users=await User.find();
   //console.log(Users);
   if(Users.length>0)
    res.send(Users);// response would be send.
   else
     res.send({result:"No event found"});
});
// admin route to handle all the events and the user registered for each event
app.get('/admin/get-events-registered', async (req, res) => {
  try {
      const All_Events = await Event.find(); // Find all the events

      const All_Events_Details = await Promise.all(All_Events.map(async (event) => { //here Promises.all to wait for all the Promises to complete and then start the further task
          // Query the EventList collection to find users registered for the current event
          const registeredUsers = await EventList.find({ event_id: event._id });

          return {
              event_name: event.name,
              event_date: event.date,
              registered: registeredUsers // Assuming there's a 'username' field in EventList
          };
      }));

   //   console.log(All_Events_Details);
      res.send(All_Events_Details);
  } catch (err) {
      console.error(err);
      res.send({ status: "fail" });
  }
});
app.post('/admin/create-event',async(req,res)=>
{
   const event_detail=await req.body;
   //console.log(event_detail);
    let added=new Event(event_detail);
    try{ let added=new Event(event_detail);
        await added.save();
        res.json({valid:true});
      }
      catch(err)
      {
        res.json({valid:false});
      }
   
   //once done
}
);

// end of the file
app.listen(5000);