require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
const connectDB = require('./config/dbConn')

const  { prepareReturnObj_withToken , createToken } = require("./utilityFunctions/util")

const userAuthRoutes = require("./routes/userAuthRoutes")
const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")
const conversationRoutes = require("./routes/conversationRoutes")
const messageRoutes = require("./routes/messageRoutes")

const upload = require("./middleware/cloudinary.config")

const User = require("./models/userModel")

let path = require('path');

const app = express()



   // middlewares
   app.use("/public", express.static(path.join(__dirname, 'public')));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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
                  res.status(200).json( prepareReturnObj_withToken(user , token) )
              }  
      
          } catch(error) { res.status(400).json({error : error.message})  }
    })

    app.use("/api/auth", userAuthRoutes )
    app.use("/api/user/profile", upload.single('profile'), userRoutes )
    app.use("/api/user/cover", upload.single("cover"), userRoutes )
    app.use("/api" , userRoutes)
    app.use("/myhome/api" , userRoutes)

    app.use("/api/user", userRoutes)
    app.use("/myhome/api/user", userRoutes)


    app.use("/api/share/image", upload.single("post") , postRoutes)
    app.use("/api/share" , postRoutes)
    app.use("/api/posts", postRoutes)

    app.use("/myhome/api/posts", postRoutes)

    app.use("/api/conversation", conversationRoutes);
    app.use("/api/message", messageRoutes);





