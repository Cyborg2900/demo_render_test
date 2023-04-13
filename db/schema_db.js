
const mongoose=require('mongoose');

// since we would have 2 types of device (1-just single output | 2- multiple input output like switchboard)

// therefore we will have 2 different kind of collection to store the data of these devices
const single_device_schema= new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 24,
  },
  email: {
    type: String,
  }
});

// we would have 4 socket therefore we are having 4 different status for coresponding sockets
const multi_device_schema= new mongoose.Schema({
  uid:{
    type: String,
    required: true,
  },

  status_1:{
    type: Boolean,
    default: false,
  },
  status_2:{
    type: Boolean,
    default: false,
  },
  status_3:{
    type: Boolean,
    default: false,
  },
  status_4:{
    type: Boolean,
    default: false,
  },

  email:String,
  sync:{
    type: Boolean,
    default: true,
  },
});


const user_schema=new mongoose.Schema({
  email: {
    type: String,
    required : true,
    unique: true,
  },
  password: String,
  s_device : [String],
  m_device : [String]
});


const User_model=mongoose.model('Users',user_schema);
const Sd_model= mongoose.model('S_Device',single_device_schema);
const Md_model=mongoose.model('M_Device',multi_device_schema);


module.exports = {User_model,Sd_model,Md_model};


