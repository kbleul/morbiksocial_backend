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


var path = require('path');

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


    //       return}) userAuthRoutes
    app.use("/api/auth", (req,res) => { console.log("boddy",req.body)} )
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





