const router = require("express").Router();
const { addMessage , getMessages } = require("../controllers/messageController")

//add Messages
router.post("/", addMessage );

//get Messages
router.get("/:conversationId", getMessages );

module.exports = router;