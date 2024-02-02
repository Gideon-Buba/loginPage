const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    fullName: { 
        type: String,
         required: true 
    },
    email: { 
        type: String,
        unique: true
    },
    phone: { 
        type: Number, 
    }, 
    password: { 
        type: String, 
         required: true
    }
})

const User = mongoose.model("User", userSchema);

module.exports = User;