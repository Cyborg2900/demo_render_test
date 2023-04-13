require('dotenv').config();
const express=require('express');

const bodyParser = require('body-parser');
const path=require('path');


const app=express();

const PORT=process.env.PORT || 6005;

app.use(bodyParser.json());
app.use(express.static('./front_end'));


app.get('/testing',(req,res)=>{
    console.log(req);
    console.log(req.body);
    console.log(req.params);
    console.log(req.query);
    res.status(200).send();
})


app.get('/',(req,res)=>{
    console.log(process.env.PORT);
    res.sendFile(path.resolve(__dirname,'./front_end/index.html'));
})
app.get('/second',(req,res)=>{
  res.sendFile(path.resolve(__dirname,'./front_end/second.html'));
})


app.listen(PORT,()=>{
    console.log('listenging to ',PORT);
})