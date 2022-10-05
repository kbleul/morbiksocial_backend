const User = require("../models/userModel")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const validator = require("validator")
const formatDistance = require('date-fns/formatDistance')

        //create a readable date
const createReadableDate = (date) => {
    const newdate = formatDistance(new Date(date),new Date());
    return newdate
}

const prepareReturnObj =  (user ) => {
    const returnObj = { _id : user._id , username : user.username , profilePicture : user.profilePicture , coverPicture : user.coverPicture, email : user.email , disc : user.disc , city : user.city , country : user.country , relationship : user.relationship , follower : user.followers , following : user.following , createdAt : createReadableDate(user.createdAt) }

    return returnObj
}



//PUT - UPDATE USER 
const updateUser = async ( req , res ) => {
    const userid = req.user
    const userparam_id = req.params.id
 
   console.log("asjdasdsak" , req.body)
    if( !mongoose.Types.ObjectId.isValid(userid._id)  || userid._id.toString() !== userparam_id)
        { return res.status(404).json({error: "User id not valid "}) }


    if(req.body.password) {

    if(!validator.isStrongPassword(req.body.password)) { 
        return res.status(404).json({error:`Please use a strong password.
         Password should include a capital letter , small letter , number and symbol`})
    }

        try {
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.password , salt) 
            req.body.password = hash
        } 
        catch(error) 
          { res.status(404).json({error: "Change user password failed "})  }
    }


       try {
       const user_json = await User.findOneAndUpdate({ _id : userparam_id } , { ...req.body })

       const updated_user = await User.findById({ _id : userparam_id })
    
          res.status(200).json(prepareReturnObj(updated_user) )

       } catch(error) { res.status(404).json({error: error}) }
}

//PUT UPDATE PROFILE Picture
const updateProfilePic = async ( req, res ) => {
      const userparam_id = req.params.id

      try {
          const user_json = await User.findOneAndUpdate({ _id : userparam_id } , { ...{"profilePicture" : req.img} })

          res.status(200).json({ profilePicture : req.img })
          }  
        catch(error) { res.status(404).json({error: "Profile picture not uploaded "}) }
}

const updateCoverPic = async ( req , res ) => {
      const userparam_id = req.params.id

      try {
          const user_json = await User.findOneAndUpdate({ _id : userparam_id } , { ...{"coverPicture" : req.img} })
       
             res.status(200).json({ coverPicture : req.img })
          }  
     catch(error) { res.status(404).json({error: "Profile picture not uploaded "})  }
}

//DELETE user
const deleteUser = async ( req , res ) => {
    const userid = req.user
    const userparam_id = req.params.id

  if(!userid || !userparam_id )
    { return res.status(404).json({error: "Bad request : id not provided"}) }

  if( !mongoose.Types.ObjectId.isValid(userid._id.toString()) ) 
    { return res.status(404).json({error: "User id is not valid "}) }

  if(!req.user_isAdmin.isAdmin && userid._id.toString() !== userparam_id ) {
             res.status(404).json({error: "Token and id mismatch"}) 
             return
    }

        const user = await User.deleteOne({ _id : userparam_id})

        if(!user) return res.status(404).json({error: "Delete user failed"})
    
        res.status(200).json(user)
    
}

//GET single user
const getUser = async ( req , res ) => {
    const {id} = req.params
console.log("id",id)
       if( !mongoose.Types.ObjectId.isValid(id) ) 
            return res.status(404).json({error: "User id is not valid "})


    const user =  await User.findById({_id : id})
  


        if(!user) return res.status(404).json({error: "User does not exist"})

        res.status(200).json(prepareReturnObj(user))
}

//UPDATE - FOLLOW user
const followUser = async ( req , res ) => {
    const currentuser = req.user._id.toString()
    const userparam_id = req.params.id

        if(currentuser !== userparam_id) {

            try {

                const user = await User.findById(userparam_id)
                const currentuser_obj = await User.findById(currentuser)

                if(!user.followers.includes(currentuser)) 
                {
                    await user.updateOne({ $push : { followers : currentuser }})
                    await currentuser_obj.updateOne({ $push : { following : user._id }})

                    res.status(200).json({status :"Followed"})
                    return
                }

                res.status(401).json({error : "You aleady follow user"})

            } catch(error) { res.status(500).json(error) }
        }

        else {  res.status(403).json("You can not follow yourself")  }

}


//UPDATE - UNFOLLOW user
const unfollowUser = async ( req , res ) => {
    const currentuser = req.user._id.toString()
    const userparam_id = req.params.id

        if(currentuser !== userparam_id) {

            try {

                const user = await User.findById(userparam_id)
                const currentuser_obj = await User.findById(currentuser)

                if(user.followers.includes(currentuser)) 
                {
                    await user.updateOne({ $pull : { followers : currentuser }})
                    await currentuser_obj.updateOne({ $pull : { following : user._id }})

                    res.status(200).json({status : "Unfollowed"})
                    return
                }

                res.status(401).json({error : "You don't follow user"})

            } catch(error) { res.status(500).json(error) }
        }

        else {  res.status(403).json("Action on yourself")  }
}

//utitlity FUNCTION
const fetchRelation = async ( type, userid, req, res ) => {
    const finalarr = []
    let  holder = []

    if(type === "followers")
     { 
        const { followers } = await User.findById({_id : userid})
        holder = [...followers ]
    }
    else {
        const { following } = await User.findById({_id : userid})
        holder = [...following ]
    }

    const userarr = holder.filter(tempU => 
                     mongoose.Types.ObjectId.isValid(tempU) )

    try {
     const fetchresults = await Promise.all(
        userarr.map(user => {
            return User.findById({ _id : user})
        })
     )

     fetchresults.forEach(user => 
        { finalarr.push(prepareReturnObj(user)) })

    res.status(200).json(finalarr)

    } catch(error) { res.status(400).json(error) }
}


//GET FOLLOWERS LIST
const getFollowers =  ( req , res ) => { fetchRelation("followers", req.user._id.toString(), req , res)  }

//GET FOLLOWING LIST
const getFollowing =  ( req , res ) => { 
    fetchRelation("following", req.user._id.toString() , req , res)  
}

//GET FRIENDS FOLLOWERS
const getFriendFollowers = ( req , res ) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) 
    { return res.status(404).json({ error: "Post id is not valid" }) }

    fetchRelation("followers", req.params.id , req , res)
}

//GET FRIENDS FOLLOWING
const getFriendFollowing = ( req , res ) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) 
    { return res.status(404).json({ error: "Post id is not valid" }) }

    fetchRelation("following", req.params.id , req , res)
}


//GET SEARCH SUGGESTION
const getSearch = async ( req , res ) => {

    const word = req.body.word
    let finalarr = []

    console.log("istrue",word === "")

    if(word === "" || word === " ") {
        res.status(200).json([])
    }

    try {
        const users = await User.find({"username": {
                        "$regex": word,
                        "$options": "i"  }}).limit(10)

    users.filter(user => user._id.toString() !== req.user._id.toString()).forEach(tempu => finalarr.push({id : tempu._id , username : tempu.username}))


        res.status(200).json(finalarr)
    
    } catch(error) { res.status(401).json(error) }
     
}



module.exports = {
    updateUser, 
    updateProfilePic , 
    updateCoverPic ,                    
    deleteUser, 
    getUser, 
    followUser, 
    unfollowUser ,
    getFollowers, 
    getFollowing,
    getFriendFollowers , 
    getFriendFollowing ,
    getSearch
}