const User = require("../models/userModel")

const { createToken , prepareReturnObj_withToken } = require("../utilityFunctions/util")


const signupUser = async(req , res) => { 
    const { username ,email , password } = req.body

    try {
        const user = await User.signup( username , email , password )

        if(typeof user === "string") {
            res.status(200).json({"error" : user} )
           }
        else {
            const token = createToken(user._id)
            res.status(200).json( prepareReturnObj_withToken(user , token) )
        }  

    } catch(error) { 
        console.log("error",error.message)
        res.status(400).json({"error" : error.message})  
    }
    
}

const loginUser = async ( req , res ) => {

    const { username_or_email  ,  password } = req.body

     try {
        const user = await User.login( username_or_email , password )

        if(typeof user === "string") {
         res.status(200).json({"error" : user} )
        }
        else {
            const token = createToken(user._id)
            res.status(200).json( prepareReturnObj_withToken(user , token) )
        }     

    } catch(error) {  
        console.log("error",error.message)
        res.status(400).json({"error" : error.message})  
    }

}

module.exports = { signupUser , loginUser }