const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique:true
    },
    lastName: {
      type: String,
      required: true,
    },
    bio:{
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber:{
        type:String,
        required:true
    },
    profile_Image:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;