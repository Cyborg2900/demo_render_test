const express=require('express');

const router=express.Router();

const {User_model,Sd_model,Md_model}=require('../db/schema_db');

router.route('/api')
    .get(async (req,res)=>{

        const {email}=req.body;

        User_model.findOne({email:email}).then((data)=>{    // extracting the info of user from db
            const {s_device,m_device}=data;
            res.json({s_device,m_device});


        }).catch((error)=>{
            console.log(error);
            res.send(error);
        })
        
    })
    .post(async (req,res)=>{
        //console.log("\n\n\n",req.body);
        const {email,password}=req.body;


        User_model.findOne({email:email}).then((data)=>{
            if(data !==null){       // checking whether a email already exits or not 
                res.send('user already exits')
                return ;  // getting out of this promise function so that further execution does not happen
            }

            const U_data=new User_model({email:email ,password:password , s_device:[] , m_device:[]});

            U_data.save().then(()=>{
                res.send('user added to db');
            }).catch((error)=>{
                console.log(error)
                res.send(error);
            })

        }).catch((error)=>{
            console.log('\n\n\n',error);
            res.send('error occured');
        })

    })


router.route('/device_status')
    .get(async(req,res)=>{
        
    })
    .put(async(req,res)=>{

    })




module.exports=router;