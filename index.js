require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const helmet = require("helmet")

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

    //middlewares
    app.use(express.json())
    app.use(helmet())

    app.use((req , res , next) => { 
        console.log(req.path, req.method , req.body)     
        next()
    })


  mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                app.listen(process.env.PORT , () => { console.log("Server is running at " + process.env.PORT )})
             })
              .catch(error => console.log(error))
    
    app.use("/api/auth", userAuthRoutes)
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





