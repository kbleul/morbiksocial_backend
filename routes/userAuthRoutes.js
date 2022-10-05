const router = require("express").Router()
const { signupUser , loginUser } = require("../controllers/userAuthController")

router.post("/login" , loginUser)

router.post("/signup" , signupUser)

module.exports = router

