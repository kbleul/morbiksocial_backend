
const mongoose = require("mongoose")

const Schema = mongoose.Schema

const postSchema = new Schema({
    userId : {
        type : String,
        required : true
    },
    username : {
        type: String,
        required: true
    },
    userProfilePicture : {
        type : String,
        default: ""
    },
    desc : {
        type : String,
        max : 500,
        default : ""
    },
    img : { 
        type : String,
        default : ""
    },
    likes : {
        type : Array,
        default : []
    },

}, { timestamps : true })

module.exports = mongoose.model("Post" , postSchema)
