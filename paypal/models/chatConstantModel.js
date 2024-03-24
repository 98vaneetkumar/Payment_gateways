const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatConstantSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  reciverId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  lastmessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  is_delete: {
    type: Number,
    default: 0,
  },
  is_favourite:{
    type:Number,
    default:0
  },  
  is_block:{
    type:Number,
    default:0
  },
  date:{
    type:String,
  },
  time:{
    type:String
  }
},{ timestamps: true });

const ChatConstant = mongoose.model('ChatConstant', chatConstantSchema);

module.exports = ChatConstant;
