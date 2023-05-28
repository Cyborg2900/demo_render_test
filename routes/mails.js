require('dotenv').config();

const express=require('express');

const router=express.Router();

const nodemailer = require('nodemailer');

const bcrypt=require('bcrypt');

const {User_model,D_model,D_username}=require('../db/schema_db');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, //ssl
    auth: {
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
    }
  });


router.route('/reset')
    .post(async(req,res)=>{
        console.log(req.body);
        User_model.findOne({email:req.body.email}).then((data)=>{
            if(data==null){
                res.send({
                    'output':'no such email exits please register'
                })
                retrun ;
            }

            const otp=Math.floor(100000 + Math.random() * 900000) // saving otp 
            User_model.updateOne({email:req.body.email},{$set : {otp:otp}}).then(()=>{
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: req.body.email,
                    subject: 'Reset Password',
                    text: `The otp for this request is 
                         ${otp}`
                  };
                
                  transporter.sendMail(mailOptions,(error,info)=>{
                    if(error){
                        console.log(error);
                        res.send({
                            'output':"error occured during reset password"
                        });
                    }else{
                        console.log('email send');
                        res.send({
                            'output':'email send succesfully '
                        });
                    }
                  })
            }).catch((error)=>{
                console.log(error);
                res.send({
                    'output':'error occured '
                })
            })

        }).catch((error)=>{
            console.log(error);
            res.send({
                'output':'error occured '
            })
        })
    })
    .put(async(req,res)=>{
        console.log(req.body);
        User_model.findOne({email:req.body.email}).then((data)=>{
            if(data==null){
                res.send({
                    'output':'no such email exits'
                })
            }else {
                if(data.otp==req.body.otp){
                    bcrypt.hash(req.body.password,10).then((hash)=>{
                        User_model.updateOne({email:req.body.email},{$set:{password:hash ,otp:null}}).then(()=>{
                            res.send({
                                'output':'password reset please login again with new password'
                            })
                        }).catch((error)=>{
                            console.log(error);
                            res.send({
                                'output':'error occured '
                            })
                        })
                    }).catch((error)=>{
                        console.log(error);
                        res.send({
                            'output':'error occured while hashing  '
                        })
                    })
                }else {
                    console.log('wrong otp ');
                    res.send({
                        'output':"wrong otp ",
                    });
    
                }
            }

            
        }).catch((error)=>{
            console.log(error);
            res.send({
                'output':'error occured '
            })
        })
    })


    module.exports=router;