const express=require('express');
const router=express.Router();

const {D_model,D_username}=require('../db/schema_db');


router.route('/get')
    .post(async(req,res)=>{ // device wants to read the status of db 

      const id=req.body.id;
      const device=req.body;
      console.log(device);
      D_model.findOne({uid:id}).then((data)=>{
        if(data.type==1){
            D_model.updateOne({uid:id},{$set: {last_time:Date.now() , status_temp:device.temp , status_hum:device.hum}}).then(()=>{
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
        }else if(data.type==2){
          D_model.updateOne({uid:id},{$set: {last_time:Date.now(), status_motion:device.motion}}).then(()=>{
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
        }
      }).catch((err)=>{
        console.log(err); 
        res.send("error occured");
      })
      
    
    })
    .put(async(req,res)=>{
      const {id,status_1,status_2,status_3,status_4}=req.body;
      D_model.findOne({uid:id}).then((device)=>{
        if(device==null){
          res.send('no such device with this id is in db');
          return;
        }
        if(device.type==1){
          D_model.updateOne({uid:id},{$set:{status_1:status_1,status_2:status_2,status_3:status_3,status_4:status_4,last_time:Date.now() , status_temp:req.body.temp , status_hum:req.body.hum}}).then(()=>{
            res.send('changes made to db');
          }).catch((err)=>{
            console.log(err); 
            res.send("error occured");
          })
        }else {
          D_model.updateOne({uid:id},{$set:{status_1:status_1,status_2:status_2,status_3:status_3,status_4:status_4,last_time:Date.now() , status_motion:req.body.motion}}).then(()=>{
            res.send('changes made to db');
          }).catch((err)=>{
            console.log(err); 
            res.send("error occured");
          })
        }
      }).catch((err)=>{
        console.log('no such device ');
        res.send('error occured');
      })
    })




module.exports=router;