const router = require("express").Router()
const requireAuth = require("../middleware/requireAuth")
const { createPost , updatePost , deletePost, likePost, getPost, getTimelinePost , getSuggestedPost , getOthersPost, getUserPost } = require("../controllers/postController")


// run authm middleware
router.use(requireAuth)

//CREATE POST
router.post("/image", createPost )

//UPDATE POST
router.put("/:id", updatePost )

//DELETE POST
router.delete("/:id", deletePost )

//LIKE POST
router.put("/like/:id", likePost )

//GET TIMELINE POSTS
router.get("/timeline/all", getTimelinePost)

//GET TIMELINE SUGGESTED POSTS
router.get("/timeline/suggested", getSuggestedPost)

//GET TIMELINE SUGGESTED POSTS
router.get("/current/:id", getOthersPost)

//GET TIMELINE SUGGESTED POSTS
router.get("/current", getUserPost)

//GET A POST
router.get("/:id", getPost)


module.exports = router
