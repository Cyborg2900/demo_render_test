const express=require('express');

const router=express.Router();

const jwt= require('jsonwebtoken');

const bcrypt=require('bcrypt');

const jwt_auth=require('../authentication/token_auth');

const {User_model,D_model,D_username}=require('../db/schema_db');
const authenticateToken = require('../authentication/token_auth');



router.route('/register')  // register the user 
    .post(async (req,res)=>{
        ///registration of user
        console.log("\n\n\n",req.body);
        // const {email,password}=req.body;
        const email=req.body.email;

        User_model.findOne({email:req.body.email}).then((data)=>{
            if(data !==null){       // checking whether a email already exits or not 
                res.json({"output":'user already exits'})
                return ;  // getting out of this promise function so that further execution does not happen
            }
            bcrypt.hash(req.body.password,10).then((hash)=>{
                console.log(hash);
                const U_data=new User_model({email:req.body.email, name : req.body.name ,password:hash,device:[]});
                const token = jwt.sign({email}, process.env.JWT_SECRET ,{expiresIn:"30m"});
                U_data.save().then(()=>{
                    console.log("user added to db");
                    res.send({
                        "output":'user added to db',
                        token:token,
                    });
                }).catch((error)=>{
                    console.log(error)
                    res.send({"output":'error occured'});
                })
            }).catch((error)=>{
                console.log(error);
                res.send({"output":"error occured"});
            })


        }).catch((error)=>{
            console.log('\n\n\n',error);
            res.send({"output":'error occured'});
        })

    })

router.route('/login')
    .post(async (req,res)=>{

        const {email,password}=req.body;

        User_model.findOne({email:email}).then((data)=>{    // extracting the info of user from db
            bcrypt.compare(password,data.password).then((response)=>{
                if(response){
                        const{devices}=data;
                        const token = jwt.sign({email}, process.env.JWT_SECRET ,{expiresIn:"30m"});
                        const demo={
                            "name":data.name,
                            "device_status":devices,
                            "token":token
                        }
                        res.json(demo);
                }else{
                    res.json({'output':'wrong password'});
                }
            }).catch((error)=>{
                console.log(error);
                res.json({'output':"error occured"});
            })


        }).catch((error)=>{
            console.log(error);
            res.json({'output':"email doesn't exists"});
        })
        
    })



router.use('/device', authenticateToken);


router.route('/device')
    .post(async(req,res)=>{  // when user ask for the status of specific decive
        console.log("\n\n",req.body.email);

        D_username.findOne({d_name:req.body.username}).then((data)=>{
            if(data.email==req.body.email){  // to check if the request made  is by a genuine owner
                D_model.findOne({uid:data.uid}).then((device)=>{
                    //console.log(device);///////////
                    if(Date.now()-device.last_time>5000 && device.device_type==1){ // to check weather device is ofline or not 
                        res.send({
                            'output':'esp is offline',
                            type:1,
                            status_1:device.status_1,
                            status_2:device.status_2,
                            status_3:device.status_3,
                            status_4:device.status_4,
                            status_temp:device.status_temp,
                            status_hum:device.status_hum,
                        });
                    }else if(Date.now()-device.last_time>5000 && device.device_type==2){
                        res.send({
                            'output':'esp is offline',
                            type:2,
                            status_1:device.status_1,
                            status_2:device.status_2,
                            status_3:device.status_3,
                            status_4:device.status_4,
                            status_motion:device.status_motion,
                        });
                    }else if(device.device_type==1){
                        res.send({
                            'output':'esp is online',
                            type:1,
                            status_1:device.status_1,
                            status_2:device.status_2,
                            status_3:device.status_3,
                            status_4:device.status_4,
                            status_temp:device.status_temp,
                            status_hum:device.status_hum,
                        })
                    }else{
                        res.send({
                            'output':'esp is online',
                            type:2,
                            status_1:device.status_1,
                            status_2:device.status_2,
                            status_3:device.status_3,
                            status_4:device.status_4,
                            status_motion:device.status_motion,
                        });

                    }
                })
            }else{
                res.send({
                    'output':'esp does not belong to you'
                })
                return ;
            }
        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
        
    })
    .put(async(req,res)=>{
        // changes made to any particular device 
        console.log(req.body,'put');
        D_username.findOne(({d_name:req.body.username})).then((data)=>{
            if(data.email==req.body.email){
                D_model.findOne({uid:data.uid}).then((device)=>{
                    const user_device=req.body;
                    if(user_device.status_1==device.status_1 && user_device.status_2==device.status_2 && user_device.status_3==device.status_3 && user_device.status_4==device.status_4){
                        D_model.updateOne({uid:data.uid},{$set : {sync:true}}).then(()=>{
                            res.send({
                                'output':'device is in sync'
                            })
                        }).catch((err)=>{
                            console.log(err)
                            res.json({'output':"error occured"});
                        })
                        
                    }else{
                        D_model.updateOne({uid:data.uid} ,{ $set: {status_1:user_device.status_1,status_2:user_device.status_2,status_3:user_device.status_3,status_4:user_device.status_4 , sync:false }}).then(()=>{
                            setTimeout(()=>{
                                D_model.findOne({uid:data.uid}).then((data1)=>{
                                    if(data1.sync){
                                        res.send({
                                            'output':'device is in sync'
                                        })
                                    }else{
                                        console.log('not in sync')
                                        res.json({'output':"error occured check after sometime"});
                                    }
                                })
                            },4000);
                        }).catch((err)=>{
                            console.log(err)
                            res.json({'output':"error occured"});
                        })
                    }
                }).catch((err)=>{
                    console.log(err)
                    res.json({'output':"error occured"});
                })
            }else{
                res.send({
                    'output':'device does not belong to you'
                })
                return ;
            }
        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
    })

router.route('/device/add')
    .post(async(req,res)=>{
        const email=req.body.email;
        console.log(req.body.username,email,'device add');
        D_username.findOne({d_name:req.body.username}).then((data)=>{
            if(data==null){
                res.send({
                    'output':'no device with this username exits '
                })
                return ;
            }
            if(data.otp==req.body.otp && data.email==null){
                User_model.updateOne({email:email},{ $push: { devices: req.body.username }}).then(()=>{
                    data.email=email;
                    data.save().then(()=>{
                        res.send({
                            'output':'esp added to db'
                        })
                    }).catch((err)=>{
                        console.log(err)
                        res.json({'output':"error occured"});
                    })
                }).catch((err)=>{
                    console.log(err)
                    res.json({'output':"error occured"});
                })
            }else if(data.otp!=req.body.otp){
                res.send({
                    'output':'wrong otp'
                });
            }else if(data.email==req.body.email){
                res.send({
                    'output':'device already registered with this email'
                })
            }else {
                res.send({
                    'output':'device already registered with another email'
                })
            }

        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
    })

    router.route('/device/delete')
        .post(async(req,res)=>{
            console.log(req.body,'delete device from user id');
            D_username.findOne({d_name:req.body.username}).then((data)=>{
                if(data==null){
                    res.send({
                        'output':'no esp with this username exits '
                    })
                    return ;
                }
                if(data.email==req.body.email){
                    User_model.updateOne({email:req.body.email},{ $pull: { devices: req.body.username }}).then(()=>{
                        data.email=null;
                        data.save().then(()=>{
                            res.send({
                                'output':'esp deleted to db'
                            })
                        }).catch((err)=>{
                            console.log(err)
                            res.json({'output':"error occured"});
                        })
                    }).catch((err)=>{
                        console.log(err)
                        res.json({'output':"error occured"});
                    })
                }else if(data.email!=req.body.email){
                    res.send({
                        'output':'device does not belong to you'
                    })
                }else if(data.email==null) {
                    res.send({
                        'output':'device already deleted from your id '
                    })
                }
    
            }).catch((err)=>{
                console.log(err)
                res.json({'output':"error occured"});
            })

        })






module.exports=router;