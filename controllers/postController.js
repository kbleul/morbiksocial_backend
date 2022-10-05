const Post = require("../models/postModel")
const User = require("../models/userModel")
const formatDistance = require('date-fns/formatDistance')


const mongoose = require("mongoose")

//create a readable date
const createReadableDate = (date) => {
    const newdate = formatDistance(new Date(date), new Date());

    return newdate
}

const createPost = async (req, res) => {


    if (!mongoose.Types.ObjectId.isValid(req.user._id.toString())) 
            { return res.status(404).json({ error: "User id is not valid" }) }

    const user = await User.findById(req.user._id.toString())

    let obj = req.img ? 
                    { 
                        userId: req.user._id.toString(), 
                        username : user.username, 
                        userProfilePicture :  user.profilePicture  ,
                        img: req.img , 
                    } :
                    { 
                        userId: req.user._id.toString(), 
                        username : user.username, 
                        userProfilePicture :  user.profilePicture  ,
                        desc: req.body.desc , 
                    }


    const newPost = new Post(obj)

    try {
        const { _id, userId, userProfilePicture, img, desc, likes, createdAt } = await newPost.save()
        
        const readabledate = await createReadableDate(createdAt)

        //create a safe json file that does not include password or other fields
        const { username, profilePicture } = user._doc


        res.status(200).json({ _id, userId, username, userProfilePicture, profilePicture, img, desc, likes, createdAt: readabledate })
    } catch (error) { res.status(500).json(error) }

}

const updatePost = async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(404).json({ error: "Post id is not valid" }) }

    if (req.body.userId) { return res.status(404).json({ error: "User id can not be changed " }) }

    try {
        const post = await Post.findById(req.params.id)

        if (post.userId !== req.user._id.toString()) { res.status(403).json("You are not authorized to update this post") }


        await post.updateOne({ $set: req.body })
        res.status(200).json(req.body)

    } catch (error) {
        res.status(500).json(error)
    }
}


const deletePost = async (req, res) => {

    const isadmin = req.user_isAdmin.isAdmin.toString()

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(404).json({ error: "Post id is not valid" }) }

    console.log(req.user_isAdmin.isAdmin, isadmin === "false")
    try {
        const post = await Post.findById(req.params.id)


        if (isadmin === "false" && post.userId !== req.user._id.toString()) { res.status(403).json("You are not authorized to delete this post") }


        await post.deleteOne()

        isadmin === "true" ? res.status(200).json("Post deleted by admin") :
            res.status(200).json("Post deleted by you")

    } catch (error) {
        res.status(500).json(error)
    }
}

const likePost = async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ error: "Post id is not valid" }) }

    try {

        const post = await Post.findById(req.params.id)

        if (!post.likes.includes(req.user._id.toString())) {
            
           let result =  await Post.findByIdAndUpdate({ _id: req.params.id },{ $push: { likes: req.user._id.toString() } })

            res.status(200).json({"status" : "Liked" , "user" : req.user._id.toString() })
        }
        else {
            let result =  await Post.findByIdAndUpdate({ _id: req.params.id },{ $pull: { likes: req.user._id.toString() } })

            res.status(200).json({"status" : "Disliked" , "user" : req.user._id.toString()})

        }

    } catch (error) { res.status(500).json(error) }

}

const getPost = async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(404).json({ error: "Post id is not valid" }) }

    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)

    } catch (error) {
        res.status(500).json(error)
    }
}

const getTimelinePost = async (req, res) => {
    let currentuser
    let friendsposts_arr  = []
    let temparr  = []

    try {
        currentuser = await User.findById(req.user._id.toString());

        const userposts = await Post.find({ userId: currentuser._id }).sort({ date: 1 });

        const friendsposts = await Promise.all(
            currentuser.following.map(friend => {
                return Post.find({ userId: friend }).sort({ date: 'desc' })
            })
        )

        friendsposts.forEach(item => {
            item.forEach(i => {
                temparr.push(i)
            })
        })


         temparr.forEach(item => {

        let userProfilePicture = ""
        let username = "Unknown"

          if(item.userProfilePicture) 
          { userProfilePicture = item.userProfilePicture  }

          if(item.username) 
          { username = item.username  }


            const { _id, userId, desc, img, likes, createdAt } = item
          

            const date = createReadableDate(createdAt)
            friendsposts_arr.push({ _id, userId, username, userProfilePicture, desc, img, likes, createdAt: date, profilePicture: currentuser.profilePicture })
        })

        userposts.forEach(item => {

             userProfilePicture = ""
             let username = "Unknown"

            if(item.userProfilePicture) 
            { userProfilePicture = item.userProfilePicture  }

            if(item.username) 
            { username = item.username  }
  

            const { _id, userId, desc, img, likes, createdAt } = item

            const date = createReadableDate(createdAt)
            friendsposts_arr.push({ _id, userId, username, userProfilePicture, desc, img, likes, createdAt: date, profilePicture: currentuser.profilePicture })
        })

      res.status(200).json(friendsposts_arr.reverse())

    } catch (error) { res.status(500).json({ error: error }) }
}

const getSuggestedPost = async (req, res) => {
    let currentuser
    let sugg_posts_arr  = []

    try {
        currentuser = await User.findById(req.user._id.toString());

        let allposts = await Post.find({}).limit(60)

     allposts = allposts.filter(tempP =>  currentuser._id.toString() !== tempP.userId && !currentuser.following.includes(tempP.userId) )

     allposts.forEach(tempP => {
        let userProfilePicture = ""
        let username = "Unknown"

        if(tempP.userProfilePicture) 
        { userProfilePicture = tempP.userProfilePicture  }

        if(tempP.username) 
        { username = tempP.username  }


          const { _id, userId, desc, img, likes, createdAt } = tempP
        

          const date = createReadableDate(createdAt)
          sugg_posts_arr.push({ _id, userId, username, userProfilePicture, desc, img, likes, createdAt: date, profilePicture: currentuser.profilePicture })
     })
          
     res.status(200).json(sugg_posts_arr.reverse())


    } catch (error) { res.status(500).json({ error: error }) }
}

//utitlity function
const getPosts = async (userid , req, res) => {
    try {
        let finalarr = []
        const currentuser = await User.findById(userid);

        const myposts = await Post.find({ userId : currentuser._id})

        myposts.forEach(post => {
        const { _id, userId, desc, img, likes, createdAt } = post
        const date = createReadableDate(createdAt)

        let userProfilePicture = ""
        let username = "Unknown"

            if(post.userProfilePicture) 
            { userProfilePicture = post.userProfilePicture  }

            if(post.username) 
            { username = post.username  }
              

            finalarr.push({ _id, userId, username, userProfilePicture, desc, img, likes, createdAt: date, profilePicture: currentuser.profilePicture })
        })

        res.status(200).json(finalarr.reverse())

    } catch(error) { res.status(500).json({ error: error }) }
}


const getUserPost = async (req, res) => { console.log("USER" ,req.user._id)
  getPosts( req.user._id.toString() , req, res )
}


const getOthersPost = async ( req , res ) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return res.status(404).json({ error: "Post id is not valid" }) }

    getPosts( req.params.id , req, res )
}

module.exports = { createPost, updatePost, deletePost, likePost, getPost, getTimelinePost ,getSuggestedPost , getOthersPost, getUserPost }