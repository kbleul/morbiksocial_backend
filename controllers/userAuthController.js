const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const formatDistance = require('date-fns/formatDistance')

//UTILITY FUNCTIONS
const createToken = (_id) => 
            { return jwt.sign({ _id } , process.env.SECRET, { expiresIn : "3d" })  }

        //create a readable date
const createReadableDate = (date) => {
    const newdate = formatDistance(new Date(date),new Date());
   
    return newdate
}

const prepareReturnObj =  (user , token ) => {
    const returnObj = {_id : user._id , profilePicture : user.profilePicture , coverPicture : user.coverPicture , username_or_email : user.username , username: user.username , email: user.email, token , disc : user.disc , city : user.city , country : user.country , relationship : user.relationship , follower : user.followers , following : user.following , createdAt : createReadableDate(user.createdAt) }

    return returnObj
}

//---------------------------------------------//

 const signupUser = async(req , res) => { 
    const { username ,email , password } = req.body

    try {
        const user = await User.signup( username , email , password )

        console.log(user)


                //create token
                const token = createToken(user._id)

        res.status(200).json( prepareReturnObj(user , token) )

    } catch(error) { res.status(400).json({error : error.message})  }
}

const loginUser = async ( req , res ) => {
    const { username_or_email  ,  password } = req.body

    try {
        const user = await User.login( username_or_email , password )
console.log("ola")
                //create token
                const token = createToken(user._id)

        res.status(200).json( prepareReturnObj(user , token) )

    } catch(error) {  res.status(400).json({error : error.message})  }

}

module.exports = { signupUser , loginUser }