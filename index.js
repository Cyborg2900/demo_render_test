require('dotenv').config();

const express=require('express');

const bodyParser = require('body-parser');
const path=require('path');

//db
const mongoose=require('mongoose')
const {MongoClient}= require("mongodb");



//routes
const users= require('./routes/users');
const devices=require('./routes/devices');

const app=express();

const PORT=process.env.PORT || 5005;


 const url = process.env.MONGO_URI;
//const url ='mongodb://localhost:27017/IOT_db2';
const client = new MongoClient(url);


app.use(bodyParser.json());
app.use('/user',users);
app.use('/device',devices);
app.use(express.static('./front_end'));

//creating a function to connect to mongodb for cyclic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}





app.get('/testing',(req,res)=>{
    console.log(req);
    console.log(req.body);
    console.log(req.params);
    console.log(req.query);
    res.status(200).send('hello world ');
})





app.get('/',(req,res)=>{
    console.log(process.env.PORT);
    res.sendFile(path.resolve(__dirname,'./front_end/index.html'));
})
app.get('/second',(req,res)=>{
  res.sendFile(path.resolve(__dirname,'./front_end/index.html'));
})














//Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})



// mongoose.connect(url).then(() => {

//     app.listen(PORT, ()=>{
//         console.log('listening to port');
//     })
//   }).catch(error => {
//     console.error(error);
//   });