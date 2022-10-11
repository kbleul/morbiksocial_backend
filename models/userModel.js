const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")

const Schema = mongoose.Schema

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        min: 1,
        max: 30,
        unique : true
    },
    email : {
        type : String,
        required : true,
        max: 50,
        unique : true
    },
    password : {
        type : String,
        required : true,
        min: 6,
    },
    profilePicture : {
        type : String,
        default : "https://res.cloudinary.com/dgavaiblp/image/upload/v1665511290/morbikSocial/placeholder/black_dzkx5m.png"
    },
    coverPicture : {
        type : String,
        default : "https://res.cloudinary.com/dgavaiblp/image/upload/v1665511293/morbikSocial/placeholder/cover_q15ffc.jpg"
    },
    followers : {
        type : Array,
        default: []
    },
    following : {
        type : Array,
        default: []
    },
    isAdmin: {
        type : Boolean,
        default : false
    },
    disc : {
        type : String,
        max: 50,
        default : "..."
    },
    country : {
        type : String,
        max: 50,
        default : "Unknown"
    },
    city : {
        type : String,
        max: 50,
        default : "Unknown"
    },
    relationship : {
        type : String,
        default : "Secret"
    }
}, { timestamps : true })


//utility function 
const matchPassword = async (password , password_two) => {
    const match = await bcrypt.compare(password , password_two)

    if(!match)  return null 

    return "match"
}


//static functions
userSchema.statics.signup = async function ( username ,email , password ) {

    //validation
    if(!username || !email || !password) 
        { return "All fields must be filled" }

    if(!validator.isEmail(email)) { return "Email is not valid" }

    if(!validator.isStrongPassword(password)) { return "Please use a strong password. Password should include a capital letter , small letter , number and symbol" }

      //check if email exists
      const email_exists = await this.findOne( { email } )
          if(email_exists ){ return "Email already exists"  }
        
      //check if username exists
      const username_exists = await this.findOne( { username } )
         if(username_exists ){ return "Username is already taken" }

        //hashing
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password , salt)
       
    const user = await this.create( { username , email , password : hash } )

    return user
}


userSchema.statics.login = async function( username_or_email , password , res ) {
    //validation
    if(!username_or_email || !password) 
        { return "All fields must be filled" }

    //if it not an email address check if it is a username instead
    if(!validator.isEmail(username_or_email)) { 
        const username = username_or_email
        const user = await this.findOne( { username } )

        if(!user ){ return "Username not found"  }

        const result = await matchPassword(password , user.password)

        if(!result) return "Incorrect Password"
   
        return user
     }

      //check if email exists
      const email = username_or_email
      const user = await this.findOne( { email } )

      if(!user ){ return "Email address not found"  }

        const result = await matchPassword(password , user.password)

     if(!result) return "Incorrect Password"


     return user
}



module.exports = mongoose.model("User" , userSchema)