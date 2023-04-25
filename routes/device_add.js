
const express=require('express');
const router=express.Router();


const {D_model,D_username}=require('../db/schema_db');


router.route('/adding-device')
    .post(async(req,res)=>{
        console.log(req.body);

        const d_username=new D_username({
            uid:req.body.id,
            d_name:req.body.d_name,
            otp:req.body.otp,
            email:null
        })

        const d_device=new D_model({
            uid:req.body.id
        })


        d_username.save().then(()=>{
            d_device.save().then(()=>res.send('device added to db')).catch((err)=>{
                res.send('error');
                console.log(err);
            })
        }).catch((err)=>{
            res.send('error');
            console.log(err);
        })
    })

module.exports=router;