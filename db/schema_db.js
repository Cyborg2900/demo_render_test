
const mongoose=require('mongoose');

// we would have 4 socket therefore we are having 4 different status for coresponding sockets
const device_schema= new mongoose.Schema({
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

  status_temp: {
    type: Number,
    default: 24,
  },

  status_hum: {
    type: Number,
    default: 24,
  },

  status_motion:{
    type:Number,
    default:0
  },


  last_time:{
    type:Number,
    require:true,
    default:0
  },
  sync:{
    type: Boolean,
    default: true,
  },
  device_type:{
    type:Number,
    default:1
  }
});



// user name schema which gives the relation between username of device and the actual device id 
const device_username=new mongoose.Schema({
  d_name:{
    unique:true,
    require:true,
    type:String
  },
  uid:{
    type:String,
    require:true
  },
  otp:Number,
  email:String
})



const user_schema=new mongoose.Schema({
  email: {
    type: String,
    required : true,
    unique: true,
  },
  password: String,
  devices : [String],
  otp:{
    type:Number,
    default:null
  },
  name:{
    type:String,
    default:null
  }
});


const User_model=mongoose.model('Users',user_schema);
// const Sd_model= mongoose.model('S_Device',single_device_schema);
const D_model=mongoose.model('Device',device_schema);
const D_username=mongoose.model('D_username',device_username);


module.exports = {User_model,D_model,D_username};
