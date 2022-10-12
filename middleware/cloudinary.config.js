const multer  = require('multer')
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

cloudinary.config({
  cloud_name : process.env.cloud_name,
  api_key : process.env.api_key,
  api_secret : process.env.api_secret,
})

const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

const storage = new CloudinaryStorage({
  cloudinary : cloudinary,
  params : {
      folder : (req , file) => `morbikSocial/${file.fieldname}`,
      format : 'png',
      allowed_formats : ['png'],
      public_id: (req , file) => uniqueSuffix + file.originalname.split(".")[0],
  }
})
  
const upload = multer({ storage: storage })

module.exports = upload