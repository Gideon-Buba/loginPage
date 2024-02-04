const express = require("express");
const session = require('express-session')
const mongoose = require("mongoose")
const ejs = require("ejs");
const bodyParser = require("body-parser");
const User = require("./models/user")
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express()
const port = 3000
const uri = "mongodb://localhost:27017/"

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: "12345", 
        resave: false,
        saveUninitialized: true
    })
);


async function connectToDb() {
    try {
        await mongoose.connect(uri)
        console.log("connected to db")
    } catch (error) {
        console.log(error.message)
    }
}

function getHash(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) return reject(err);

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if(err) return reject(err);
                return resolve(hashedPassword);
            })
        })
    })
}

app.get("/", (req, res) => {
    res.render("signup", { title: "Home" });
})

app.post("/signup", async(req, res) => {
    try{
        const { name, email, password } = req.body;

        // Hash the password before storing it
        const hashedPassword = await getHash(password);

        // Create a new user instance with the hashed password
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        res.redirect("/login");
    } catch(error) {
        console.log(error);
        res.status(500).send("Error creating account")
    }
})

app.get("/login", (req, res) => {
    return res.render("login", { email_error: false, password_error: false })
})
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Retrieve the user from the database based on the provided name
        const user = await User.findOne({ email });
    
        if(!user) {
            return res.render("login", {
                email_error: true
            })
        }

        console.log(user);

        // Check if the user exists and the password is correct
        if (user && await bcrypt.compare(password, user.password)) {

            req.session.user = { name : user.name }

            // Redirect to a dashboard or home page after successful login
            res.redirect("/dashboard");
        } else {
            // Display an error message if login fails
            res.render("login", { title: "Login", error: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error.message);
        return res.render("login", {
            email_error: true,
            password_error: true
        })
    }
})

app.get("/dashboard", (req, res) => {
    // Check if the user is logged in
    if (req.session.user) {
        const { name } = req.session.user;
        // Render the dashboard with the welcome message
        return res.render("dashboard", { title: "Dashboard", name });
    } else {
        // Redirect to the login page if the user is not logged in
        return res.redirect("/login");
    }
});


connectToDb().then(() => {
    app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
   });
}); 
