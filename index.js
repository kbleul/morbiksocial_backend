require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
//const helmet = require("helmet")
// const bodyParser = require('body-parser')
const cors = require("cors");
const connectDB = require('./config/dbConn')

const userAuthRoutes = require("./routes/userAuthRoutes")
const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")
const conversationRoutes = require("./routes/conversationRoutes")
const messageRoutes = require("./routes/messageRoutes")
const jwt = require("jsonwebtoken")
const formatDistance = require('date-fns/formatDistance')

const User = require("./models/userModel")


var path = require('path');

const prepareReturnObj =  (user , token ) => {
  const returnObj = {_id : user._id , profilePicture : user.profilePicture , coverPicture : user.coverPicture , username_or_email : user.username , username: user.username , email: user.email, token , disc : user.disc , city : user.city , country : user.country , relationship : user.relationship , follower : user.followers , following : user.following , createdAt : createReadableDate(user.createdAt) }

  return returnObj
}

//create a readable date
const createReadableDate = (date) => {
  const newdate = formatDistance(new Date(date),new Date());
    
    return newdate
}

//UTILITY FUNCTIONS
const createToken = (_id) => 
            { return jwt.sign({ _id } , process.env.SECRET, { expiresIn : "3d" })  }

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {  cb(null, 'public/data/uploads/') },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

      const [ originalname , extension] = file.originalname.split(".")
      const fullImgName = originalname + "" + file.fieldname + '-' + uniqueSuffix +  "." + extension
      cb(null, fullImgName)

      req.img = fullImgName
    }
  })
  
const upload = multer({ storage: storage })

const app = express()

app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
    //middlewares
    //app.use(helmet())

    app.use(cors());

    app.use((req , res , next) => { 
        console.log(req.path, req.method , req.body)     
        next()
    })
  
  connectDB()


mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
})

    app.use("/api/signup", async (req , res) => {
      const { username ,email , password } = req.body
      console.log("herer")
          try {
              const user = await User.signup( username , email , password )
      
              console.log(user)
      
              if(typeof user === "string") {
                  res.status(200).json({"error" : user} )
                 }
              else {
                  const token = createToken(user._id)
                  res.status(200).json( prepareReturnObj(user , token) )
              }  
      
          } catch(error) { res.status(400).json({error : error.message})  }
    })

    app.use("/api/auth", userAuthRoutes )
    app.use("/api/user/profile", upload.single('avatar'), userRoutes )
    app.use("/api/user/cover", upload.single("cover"), userRoutes )
    app.use("/api" , userRoutes)
    app.use("/myhome/api" , userRoutes)

    app.use("/api/user", userRoutes)
    app.use("/myhome/api/user", userRoutes)


    app.use("/api/share/image", upload.single("share") , postRoutes)
    app.use("/api/share" , postRoutes)
    app.use("/api/posts", postRoutes)

    app.use("/myhome/api/posts", postRoutes)

    app.use("/api/conversation", conversationRoutes);
    app.use("/api/message", messageRoutes);





