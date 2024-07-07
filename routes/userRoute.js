const express = require("express");
const router = express.Router();
const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Video = require("../models/videoModal.js");
const mailchimpClient = require("@mailchimp/mailchimp_transactional")(
  process.env.MAILCHIMP_KEY
);
const cloudinary=require('../config/cloudinaryConfig.js');
const { sendEmail } = require("../config/nodeMailerConfig.js");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ $or: [{ email:req.body.email }, { firstName:req.body.firstName }] });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
   
    const specialChars = "&*@#^!%!#&##)(";
  
    const firstFourDigits = req.body.mobileNumber.toString().slice(0, 4);
    
    const getRandomSpecialChar = () => {
      const randomIndex = Math.floor(Math.random() * specialChars.length);
      return specialChars.charAt(randomIndex);
    };

    const password = `${req.body.firstName}${getRandomSpecialChar()}${req.body.lastName}${getRandomSpecialChar()}${firstFourDigits}`;
  
    console.log("🚀 ~ router.post ~ password:", password)
    await sendEmail(req.body.email,"Password for Bansal Assignment","",`<h1>Welcome! Thankyou for signing up </h1> <p>Here is your password : ${password}`)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ firstName: req.body.firstName });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId })
    const videos = await Video.find({ user: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {user,videos},
      });
    }
  } catch (error) {
    console.error(error.message)
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find()
    const usersWithVideos = await Promise.all(users.map(async (user) => {
      const videos = await Video.find({ user: user._id }).limit(5).exec();
      return { ...user._doc, videos };
    }));

    res.status(200).send({ success: true, data: usersWithVideos });
  } catch (error) {
    console.error('Error fetching users with videos:', error);
    res.status(500).send({ success: false, message: 'Error fetching users with videos', error });
  }
});


router.post('/upload-image',authMiddleware,async(req,res)=>{
  let image=req.body.image
  try {
      const result=await cloudinary.uploader.upload(image,{
          folder:"images",
          width:300,
          height:300,
          crop:"scale"
      })
      const updatedUser=await User.findByIdAndUpdate(
        {_id: req.body.userId},
      { "profile_Image":result.secure_url },
      { new: true } 
      )
      res.status(200).json({
          message:'Image upload successfully',
          data:null,
          success:true
      })
  } catch (error) {
      // console.log("🚀 ~ router.post ~ error:", error)
      res.status(401).json({
          message:error.message,
          data:null,
          success:false
      })
  }
})

router.post("/update-bio", authMiddleware, async (req, res) => {
  try {
    if (!req.body.bio) throw new Error('Bio not available')
    const user = await User.findByIdAndUpdate(
      {_id: req.body.userId},
      { "bio":req.body.bio },
      { new: true } 
    );
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.error(error.message)
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});


router.post('/get-user-info',async(req,res)=>{
  try {
    const user = await User.findOne({ firstName:req.body.firstName,lastName:req.body.lastName })
    if(!user) {
      return res.status(500).send({ message: "User does not exist", success: false });
    }
    const videos = await Video.find({ user:user.id });
    user.password = undefined;
    if (!user) {
      return res
        .status(500)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {user,videos},
      });
    }
  } catch (error) {
    console.error(error.message)
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
})

// router.post('/add-email', async (req, res) => {
//   try {
//     const response = await mailchimpClient.allowlists.add({
//       email: "lakshaylota@gmail.com",
//     });
//     return res.json({ message: response, status: "send email resp" })
//   } catch (err) {
//     console.error(err)
//     return res.json({ status: false, error: err.message })
//   }
// })

// router.post('/list-email', async (req, res) => {
//   try {
//     // const response = await mailchimpClient.allowlists.list();
//     // console.log(response);
//     const message = {
//       from_email: "24yb2003@gmail.com",
//       subject: "Account Setup Successfully",
//       text: "Welcome to yb world",
//       to: [
//         {
//           email: "lakshaylota@yb.com",
//           type: "to"
//         }
//       ]
//     };

//     const response = await mailchimpClient.messages.send({
//       message
//     });
//     console.log(response);
//     return res.json({ message: response, status: "list email resp" })
//   } catch (err) {
//     return res.json({ status: false, error: err.message })
//   }
// })


module.exports = router