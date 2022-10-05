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
        default : "black.png"
    },
    coverPicture : {
        type : String,
        default : "cover.jpg"
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
    if(!username || !email || !password) { throw Error("All fields must be filled") }

    if(!validator.isEmail(email)) { throw Error("Email is not valid") }

    if(!validator.isStrongPassword(password)) { throw Error("Please use a strong password. Password should include a capital letter , small letter , number and symbol") }

      //check if email exists
      const email_exists = await this.findOne( { email } )
          if(email_exists ){ throw Error("Email already exists")  }
        
      //check if username exists
      const username_exists = await this.findOne( { username } )
         if(username_exists ){ throw Error("Username is already taken")  }

        //hashing
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password , salt)
       
    const user = await this.create( { username , email , password : hash } )

    return user
}


userSchema.statics.login = async function( username_or_email , password ) {
    //validation
    if(!username_or_email || !password) { throw Error("All fields must be filled") }

    //if it not an email address check if it is a username instead
    if(!validator.isEmail(username_or_email)) { 
        const username = username_or_email
        const user = await this.findOne( { username } )

        if(!user ){ throw Error("Username not found")  }

        const result = await matchPassword(password , user.password)

        if(!result) throw Error("Incorrect Password") 
   
        return user
     }

      //check if email exists
      const email = username_or_email
      const user = await this.findOne( { email } )

      if(!user ){ throw Error("Email address not found")  }

        const result = await matchPassword(password , user.password)

     if(!result) throw Error("Incorrect Password") 

     return user
}


module.exports = mongoose.model("User" , userSchema)