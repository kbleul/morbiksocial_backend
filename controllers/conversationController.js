const Conversation = require("../models/conversationModel");
const mongoose = require("mongoose");

const addConversation = async (req, res) => {

  try {

      if( !mongoose.Types.ObjectId.isValid(req.body.senderId) || !mongoose.Types.ObjectId.isValid(req.body.receiverId) ) 
        {   throw "user id is not valid";    }

      //check if sender and current user match
      if(req.user._id.toString() !== req.body.senderId )
            {   throw "Sender is not logged in";    }

      if(req.body.senderId === req.body.receiverId)
           {   throw "Sender and Receiver are the same";    }

  //check if conversation has  aleady created created
    const conversation = await Conversation.findOne({
      members: { $all: [req.body.senderId , req.body.receiverId] },
    });

    if(conversation === null ) { throw "empty"  }
    else { throw "Conversation aleady created between users" }


  } catch (err) {
    if(err !== "empty") {  return res.status(500).json({error:err});  }
  }


    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();

      if(!savedConversation){ throw "Conversation not saved" }

      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  
}

const getConversation = async (req, res) => {
    try {
      if( !mongoose.Types.ObjectId.isValid(req.params.userId) ) 
                {   throw "user id is not valid";    }

      //check if sender and current user match
      if(req.user._id.toString() !== req.params.userId )
            {   throw "User is not logged in";    }

      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });

      res.status(200).json(conversation);

    } catch (err) {  res.status(500).json(err);  }
}

const getBetweenConversation = async (req, res) => { 
    try {
      if( !mongoose.Types.ObjectId.isValid(req.params.firstUserId)  || !mongoose.Types.ObjectId.isValid(req.params.secondUserId)) 
              {   throw "user id is not valid";    }

          //check if sender and current user match
          if(req.user._id.toString() !== req.params.firstUserId )
          {   throw "User is not logged in";    }

      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation)

    } catch (err) {  res.status(500).json(err);   }
}

module.exports = {
    addConversation,
    getConversation,
    getBetweenConversation
}