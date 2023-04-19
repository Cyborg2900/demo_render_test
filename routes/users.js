const express=require('express');

const router=express.Router();

const jwt= require('jsonwebtoken');

const bcrypt=require('bcrypt');

const {User_model,Sd_model,Md_model}=require('../db/schema_db');



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

                U_data.save().then(()=>{
                    console.log("user added to db");
                    res.send({
                        "output":'user added to db'
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
                        const {s_device,m_device}=data;
                        const token = jwt.sign({email}, process.env.JWT_SECRET ,{expiresIn:"30m"});
                        const demo={
                            "name":data.name,
                            "single_device":s_device,
                            "multi_device":m_device,
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






router.route('/device_status')
    .get(async(req,res)=>{
        if(!req.body.token){
            res.status(401).send({"output":"Unauthorized request no token provided"});
        }

        try {
            const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
            
            User_model.findOne({email:decode.email}).then((user_data)=>{
                const s_device=user_data.s_device;

                const device_data={};

                const read_db=function(id){ // creating a promise funtion to read the status of all the devices of the user
                    return new Promise((rej, res)=>{
                        Sd_model.findOne({uid:id}).then((s_data)=>{
                            device_data.id.single=s_data.status;
                        }).then(()=>{
                            Md_model.findOne({uid:id}).then((m_data)=>{
                                device_data.id.multi={
                                    status_1:m_data.status_1,
                                    status_1:m_data.status_2,
                                    status_1:m_data.status_3,
                                    status_1:m_data.status_4,
                                };
                            })
                        })
                    })
                }
                let promises =[] // creating an array to store all promises for the for loop
                s_device.forEach((id)=>{  // reading data of each id that is assign to that email and creating its promise
                    read_db(id);
                })

                // resolving all promises before sending the response to user
                Promise.all(promises).then(()=> res.send(device_data)).catch((error)=>{
                    console.log(error);
                    res.status(400).send({"output":"error occured while reading the status of devices"});
                })

            })
          } catch (err) {
            res.status(400).send({"output":"Invalid token."});
          }

        
    })
    .put(async(req,res)=>{

    })






module.exports=router;