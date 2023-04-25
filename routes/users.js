const express=require('express');

const router=express.Router();

const jwt= require('jsonwebtoken');

const bcrypt=require('bcrypt');

const jwt_auth=require('../authentication/token_auth');

const {User_model,D_model,D_username}=require('../db/schema_db');



router.route('/register')  // register the user 
    .post(async (req,res)=>{
        ///registration of user
        console.log("\n\n\n",req.body);
        // const {email,password}=req.body;


        User_model.findOne({email:req.body.email}).then((data)=>{
            if(data !==null){       // checking whether a email already exits or not 
                res.json({"output":'user already exits'})
                return ;  // getting out of this promise function so that further execution does not happen
            }
            bcrypt.hash(req.body.password,10).then((hash)=>{
                console.log(hash);
                const U_data=new User_model({email:req.body.email, name : req.body.name ,password:hash, s_device:[] , m_device:[]});
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



router.use('/device',jwt_auth);


router.route('/device/get')
    .post(async(req,res)=>{  // when user ask for the status of specific decive
        console.log("\n\n\n",req.body.email);

        D_username.findOne({d_name:req.body.device_name}).then((data)=>{
            D_model.findOne({uid:data.id}).then((device)=>{
                
                if(Date.now()-device.last_time>5000){ // to check weather device is ofline or not 
                    res.send({
                        'output':'device is ofline',
                        status_1:device.status_1,
                        status_2:device.status_2,
                        status_3:device.status_3,
                        status_4:device.status_4,
                        status_temp:device.status_temp
                    })
                }else{
                    res.send({
                        status_1:device.status_1,
                        status_2:device.status_2,
                        status_3:device.status_3,
                        status_4:device.status_4,
                        status_temp:device.status_temp,
                    })
                }
            })
        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
        
    })
    .put(async(req,res)=>{
        // changes made to any particular device 
        D_username.findOne(({d_name:req.body.device_name})).then((data)=>{
            Md_model.findOne({uid:data.id}).then((device)=>{
                const user_device=req.body;
                if(user_device.status_1==device.status_1 && user_device.status_2==device.status_2 && user_device.status_3==device.status_3 && user_device.status_4==device.status_4){
                    Md_model.updateOne({uid:id},{$set : {sync:true}}).then(()=>{
                        res.send({
                            'output':'device is in sync'
                        })
                    }).catch((err)=>{
                        console.log(err)
                        res.json({'output':"error occured"});
                    })
                    
                }else{
                    Md_model.updateOne({uid:id} ,{ $set: {status_1:user_device.status_1,status_2:user_device.status_2,status_3:user_device.status_3,status_4:user_device.status_4 , sync:false }}).then(()=>{
                        setTimeout(()=>{
                            Md_model.findOne({uid:id}).then((data)=>{
                                if(data.sync){
                                    res.send({
                                        'output':'device is in sync'
                                    })
                                }else{
                                    console.log('not in sync')
                                    res.json({'output':"error occured check after sometime"});
                                }
                            })
                        },3000);
                    }).catch((err)=>{
                        console.log(err)
                        res.json({'output':"error occured"});
                    })
                }
            }).catch((err)=>{
                console.log(err)
                res.json({'output':"error occured"});
            })
        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
    })

router.route('device/add')
    .post(async(req,res)=>{
        const email=req.body.email;
        D_username.findOne({d_name:req.body.username}).then((data)=>{
            if(data==null){
                res.send({
                    'output':'no device with this username exits '
                })
                return ;
            }
            if(data.otp==req.body.otp){
                User_model.updateOne({email:email},{ $push: { s_device: req.body.username ,m_device:req.body.username }}).then(()=>{
                    data.email=email;
                    data.save().then(()=>{
                        res.send({
                            'output':'device added to db'
                        })
                    }).catch((err)=>{
                        console.log(err)
                        res.json({'output':"error occured"});
                    })
                }).catch((err)=>{
                    console.log(err)
                    res.json({'output':"error occured"});
                })
            }else{
                res.send({
                    'output':'wrong otp'
                });
            }

        }).catch((err)=>{
            console.log(err)
            res.json({'output':"error occured"});
        })
    })






module.exports=router;