
 const mongoose = require('mongoose')

const connectDB = async () => {
        try {   await mongoose.connect(process.env.MONGO_URI,{
                useNewUrlParser:true,
                useUnifiedTopology:true
            }) } 
        catch (err) {  console.log("myerror : " , err)  }
}

module.exports = connectDB