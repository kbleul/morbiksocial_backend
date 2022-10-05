const Message = require("../models/messageModel");
const mongoose = require("mongoose");
const formatDistance = require('date-fns/formatDistance')


  //create a readable date
const createReadableDate = (date) => {
    const newdate = formatDistance(new Date(date),new Date());
    
    return newdate
}

const addMessage = async (req, res) => { 
    try {
      //check if sender and current user match
      if(req.user._id.toString() !== req.body.sender )
            {   throw "Sender is not logged in";    }

      if( !mongoose.Types.ObjectId.isValid(req.body.conversationId) || !mongoose.Types.ObjectId.isValid(req.body.sender) ) 
            {   throw "conversationId or sender id  not valid";    }
    
      if(!req.body.conversationId || !req.body.sender  || !req.body.text )
            { throw "Empty body or missing field"}

    } catch (err) { res.status(500).json(err);  }

    const newMessage = new Message(req.body);

    try {

    } catch (err) {  res.status(500).json(err); }

      try {
         const { _id , sender , conversationId , text , createdAt} = await newMessage.save();
        res.status(200).json({ _id , sender , conversationId , text , createdAt : createReadableDate(createdAt) });

      } catch (err) {  res.status(500).json(err);  }
}

const getMessages = async (req, res) => {
  const finalarr = []
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      });

      messages.forEach(message => {
        const { _id , sender , conversationId , text , createdAt} = message
        finalarr.push({ _id , sender , conversationId , text , createdAt : createReadableDate(createdAt) })
      })

      res.status(200).json(finalarr);

    } catch (err) {  res.status(500).json(err);   }
  }

module.exports = {
    addMessage,
    getMessages,
}