const router = require("express").Router()
const requireAuth = require("../middleware/requireAuth")

const { updateUser , updateProfilePic , updateCoverPic , deleteUser , getUser , followUser , unfollowUser, getFollowers, getFollowing , getFriendFollowers , getFriendFollowing , getSearch} = require("../controllers/userController")


    //run authm middleware
    router.use(requireAuth)

//UPDATE USER PROFILE PIC
router.put("/updateProfile/:id", updateProfilePic)

//UPDATE USER COVER PIC
router.put("/updateCover/:id", updateCoverPic)

//PUT SEARCH SUGGESTION
router.put("/search", getSearch)

//UPDATE USER 
router.put("/:id", updateUser)

//DELETE USER 
router.delete("/:id", deleteUser)

//GET FRIENDS FOLLOWERS
router.get("/followers/:id", getFriendFollowers)

//GET FRIENDS FOLLOWING
router.get("/following/:id", getFriendFollowing)

//GET USER FOLLOWERS
router.get("/followers", getFollowers)

//GET USER FOLLOWING
router.get("/following", getFollowing)

//GET USER
router.get("/:id", getUser)

//FOLLOW USER
router.put("/follow/:id", followUser)

//UNFOLLOW USER
router.put("/unfollow/:id", unfollowUser)


module.exports = router