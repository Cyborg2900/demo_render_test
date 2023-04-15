const express=require('express');
const router=express.Router();

const {User_model,Sd_model,Md_model}=require('../db/schema_db');

router.route('/api')
    .get(async(req,res)=>{
        const {id,dd1,dd2,dd3,dd4,ad1}=req.body;

        //finding the device field from db
        Md_model.find({uid:id}).then((data1)=>{
          return  Sd_model.find({uid:id}).then((data)=>{ return [data,data1] });
        }).then((data)=>{

          const [[S_data],[M_data]]=data;

          // checking whether the db and device are synced or not 
          if(dd1== M_data.status_1 && dd2==M_data.status_2 && dd3==M_data.status_3 && dd4==M_data.status_4 ){
              M_data.sync=true;

              S_data.status=ad1;
              // saving the current state of devices to db
              S_data.save().then(()=>{
                M_data.save()

              }).then(()=>{
                res.send('synced'); // once state is updated in db then sending a response 

              }).catch((error)=>{
                console.log(error);
                res.send(error);
              })


          }else{  // if not synced then changing flag to false and sending the changes to device 
              S_data.status=ad1;
              M_data.sync=false;


              S_data.save().then(()=>{  // updating the temp and sync flag
                M_data.save()

              }).then(()=>{
                res.json({ // sending the updates to the device 
                  "dd1":M_data.status_1,
                  "dd2":M_data.status_2,
                  "dd3":M_data.status_3,
                  "dd4":M_data.status_4
                }); 

              }).catch((error)=>{
                console.log(error);
                res.send(error);
              })
            }

          }
          
        ).catch((error)=>{
            console.log(error);
            res.send(error);
        })
        

    })
    .post(async(req,res)=>{
        const{email,id}=req.body;
        console.log(email,id," hello world hello ");
        const M_data = new Md_model({ uid:id, email:email });
        const S_data = new Sd_model({ uid:id, email:email });

        // adding device to the email and to the db and checking for any duclicacy of the ids 
        Sd_model.findOne({uid:id}).then((data)=>{ // check if the device already exits in db or not 
          if(data !== null){
            console.log(data);
            res.send("device already exits in db");
            return ;
          }

            // adding new device id to the email of user
          User_model.updateOne({ email:email }, { $push: { s_device: id ,m_device:id } }).then(() => {
            M_data.save(); // saving the device to the collection
          }).then(()=>{ // saving to db
            S_data.save(); // saving the device to the collection
          }).then(()=>{ // saving to db
            res.status(200).send('device added to db'); // sending response back to device for the comfirmation 
          }).catch((error) => {
              console.log(error);
              res.send(error);
            });


          }).catch((error)=>{
            console.log(error);
            res.send("error");
          })



    })
    .put(async(req,res)=>{

      const {id,dd1,dd2,dd3,dd4,ad1}=req.body;

        //finding the device field from db
        Md_model.find({uid:id}).then((data1)=>{
          return  Sd_model.find({uid:id}).then((data)=>{ return [data,data1] });
        }).then((data)=>{
          const [[S_data],[M_data]]=data;

          if(S_data===null || M_data===null){
            res.send('device doesnot exits');
            return ;
          }

          // checking whether the db and device are synced or not 
          if(dd1== M_data.status_1 && dd2==M_data.status_2 && dd3==M_data.status_3 && dd4==M_data.status_4 ){
              M_data.sync=true;

              S_data.status=ad1;
              // saving the current state of devices to db
              S_data.save().then(()=>{
                M_data.save()

              }).then(()=>{
                res.send('synced'); // once state is updated in db then sending a response 

              }).catch((error)=>{
                console.log(error);
                res.send(error);
              })


          }else{  // if not synced then changing flag to false and sending the changes to device 
              S_data.status=ad1;
              M_data.sync=false;


              S_data.save().then(()=>{  // updating the temp and sync flag
                M_data.status_1=dd1;
                M_data.status_2=dd2;
                M_data.status_3=dd3;
                M_data.status_4=dd4;
                M_data.save();

              }).then(()=>{
                res.json('changes made to db '); 

              }).catch((error)=>{
                console.log(error);
                res.send(error);
              })
            }

          }
          
        ).catch((error)=>{
            console.log(error);
            res.send(error);
        })
        
    })


router.route('/demo')
    .get(async(req,res)=>{

      const id='abcde1';
    
      Md_model.findOne({uid:id}).then((data)=>{
        console.log(data);
        res.status(200).send(data);
      }).catch((error)=>{
        console.log(error);
        res.send(error);
      })
    
    })




module.exports=router;