const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema


const userSchema = new Schema({

  name: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    required: false
  },
  last_login: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {timestamps: true})

userSchema.pre('save', async function(next){

  if(!this.isModified('password')){
    next()
  }

  const salt = await bcrypt.genSalt(10)

  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods = {

  matchPasswords: async function(password){
    
    const passwordMatch = await bcrypt.compare(password, this.password)
    return passwordMatch
  }

}

const User = mongoose.model("user", userSchema)
module.exports = User