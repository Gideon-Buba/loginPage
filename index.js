const express = require("express");
const mongoose = require("mongoose")
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("./models/user")
const bcrypt = require("bcrypt")
const saltRounds = 10;

const app = express()
const port = 3000
const uri = "mongodb://localhost:27017/"

app.set('view engine', 'ejs');
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


app.get("/", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

// 404 page

app.use((req, res) => {
    res.status(404).render("404")
})

connectToDb().then(() => {
    app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
   });
}); 
