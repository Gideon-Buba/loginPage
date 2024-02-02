const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const path = require("path");
const User = require("./models/user")
const bcrypt = require("bcrypt")
const saltRounds = 10;

const app = express()
const port = 3000
const uri = "mongodb://localhost:27017/"

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


async function connectToDb() {
    try {
        await mongoose.connect(uri)
        console.log("connected to db")
    } catch (error) {
        console.log(error.message)
    }
}

async function getHash(password) {
    new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) reject(err);

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if(err) reject(err);

                resolve(hashedPassword);
            })
        })
    })
}

app.post('/login', async (req, res) => {

    try {
        const user = User.create({...req.body})
        res.json({ message : "sign up succesful" })
    }

    // const password = req.body.password
    
    // const hashedPassword = getHash(password)

    // try {
    //     const user = new User({
    //             fullname: "Gideon Buba",
    //             email: "bubaambore@gmail.com",
    //             phone: +2348187909619,
    //             password: hashedPassword
    //         });

    //         const result = await user.save()
     catch(error) {
        console.log(error)
        res.status(500).send("Internal Server error")
    }

})




connectToDb().then(() => {
    app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
   });
}); 
