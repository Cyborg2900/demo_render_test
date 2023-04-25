const express=require('express');
const router=express.Router();

const {D_model,D_username}=require('../db/schema_db');


router.route('/get')
    .post(async(req,res)=>{ // device wants to read the status of db 

      const id=req.body.id;
      const device=req.body;
      D_model.findOne({uid:id}).then((data)=>{
        D_model.updateOne({uid:id},{$set: {last_time:Date.now()}}).then(()=>{
          if(data.status_1==device.status_1 && data.status_2==device.status_2 && data.status_3==device.status_3 && data.status_4==device.status_4){
            D_model.updateOne({uid:id},{$set:{sync:true}}).then(()=>{
                res.send('device are in sync');
            }).catch((err)=>{
              console.log(err); 
              res.send("error occured");
            })
          }else{
            D_model.updateOne({uid:id},{$set:{sync:false}}).then(()=>{
              res.send({
                status_1:data.status_1,
                status_2:data.status_2,
                status_3:data.status_3,
                status_4:data.status_4,
              })
            }).catch((err)=>{
              console.log(err); 
              res.send("error occured");
            })
          }
        }).catch((err)=>{
          console.log(err); 
          res.send("error occured");
        })
      }).catch((err)=>{
        console.log(err); 
        res.send("error occured");
      })
      
    
    })
    .put(async(req,res)=>{
      const {id,status_1,status_2,status_3,status_4}=req.body;
      D_model.findOne({uid:id}).then((device)=>{
        if(device==null){
          res.send('no such device with this is in db');
          return;
        }
        D_model.updateOne({uid:id},{$set:{status_1:status_1,status_2:status_2,status_3:status_3,status_4:status_4,last_time:Date.now()}}).then(()=>{
          res.send('changes made to db');
        }).catch((err)=>{
          console.log(err); 
          res.send("error occured");
        })
      }).catch((err)=>{
        console.log('no such device ');
        res.send('error occured');
      })
    })




module.exports=router;