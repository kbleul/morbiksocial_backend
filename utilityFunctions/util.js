const jwt = require("jsonwebtoken")
const formatDistance = require('date-fns/formatDistance')
const bcrypt = require("bcrypt")

const User = require("../models/userModel")
const Post = require("../models/postModel")



const createReadableDate = (date) => {
    const newdate = formatDistance(new Date(date),new Date());
      return newdate
}

const prepareReturnObj_Post = ( post , currentuser ) => {
    const { _id, userId, desc, img, likes, createdAt } = post
        const date = createReadableDate(createdAt)

        let userProfilePicture = ""
        let username = "Unknown"

            if(post.userProfilePicture) 
            { userProfilePicture = post.userProfilePicture  }

            if(post.username) 
            { username = post.username  }
    
    const returnObj = { _id, userId, username, userProfilePicture, desc, img, likes, createdAt: date, profilePicture: currentuser.profilePicture }

    return returnObj
}

const prepareReturnObj =  ( user ) => {
    const returnObj = { _id : user._id , username : user.username , profilePicture : user.profilePicture , coverPicture : user.coverPicture, email : user.email , disc : user.disc , city : user.city , country : user.country , relationship : user.relationship , follower : user.followers , following : user.following , createdAt : createReadableDate(user.createdAt) }

    return returnObj
}

const prepareReturnObj_withToken =  (user , token ) => {
    const returnObj = {_id : user._id , profilePicture : user.profilePicture , coverPicture : user.coverPicture , username_or_email : user.username , username: user.username , email: user.email, token , disc : user.disc , city : user.city , country : user.country , relationship : user.relationship , follower : user.followers , following : user.following , createdAt : createReadableDate(user.createdAt) }
  
    return returnObj
}


//get a specific users posts using userid
const getPosts = async (userid , res) => {
    try {
        let finalarr = []
        const currentuser = await User.findById(userid);

        const myposts = await Post.find({ userId : currentuser._id})

        myposts.forEach(post => {
            finalarr.push(prepareReturnObj_Post(post ,currentuser))
        })

        res.status(200).json(finalarr.reverse())

    } catch(error) { res.status(500).json({ error: error }) }
}


const createToken = (_id) => { 
    return jwt.sign({ _id } , process.env.SECRET, { expiresIn : "3d" })  
}

const matchPassword = async (password , password_two) => {
    const match = await bcrypt.compare(password , password_two)

    if(!match)  return null 

    return "match"
}

module.exports = { createReadableDate , prepareReturnObj_Post , prepareReturnObj  , prepareReturnObj_withToken , getPosts , createToken , matchPassword }