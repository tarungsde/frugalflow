import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";


const app = express();
const port = 3000;
const saltRounds = 3;

dotenv.config();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/Otunar")
  .then(() => console.log("Connected to DB sucessfully"))
  .catch(err => console.log("Error while connecting to DB"));

app.get("/", (req, res) => {
  res.json("hello from backend");
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/otunar", passport.authenticate("google", {
    successRedirect: "http://localhost:5173/app", 
    failureRedirect: "http://localhost:5173/login?error=Invalid credentials",
  })
);


app.get("/logout", (req, res) => {
  req.logOut(err => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ loggedIn: true, user: req.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});


app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({email});
  if (existingUser) {
    return res.status(404).json({ message : "Account already exists."});
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);  
  const newUser = new User({
    email,
    password : hashedPassword,
  });

  await newUser.save();

  req.login(newUser, err=> {
    if (err) {
      console.log("Login error:", err);
      return res.status(500).json({ message: "Login failed after registration" }); 
    }

    return res.status(201).json({ message: "User registered and logged in successfully" });
  });

});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ success: false, message: info?.message || "Login failed" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).json({ success: true, message: "Login successful", user });
    });
  })(req, res, next);
});


passport.use("local",
  new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {

    try {
      const existingUser = await User.findOne({email});

      if (!existingUser) {
        console.log("Account does not exist.");
        return cb(null, false, { message: "Account does not exist" });
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);

      if (!isMatch) {
        console.log("Invalid Credentials");
        return cb(null, false, { message: "Invalid Credentials" });
      }
      return cb(null, existingUser);

    } catch (err) {
      console.error("Error during authentication:", err);
      return cb(err);
    }
  })
);

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/otunar",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, cb) => {

  try {
    const existingUser = await User.findOne({email : profile.email});

    if (existingUser) {
      cb(null, existingUser);
    } else {
      const newUser = new User({
        email : profile.email,
        password : "google",
      });
      newUser.save();
      cb(null, newUser);
    }
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}.`)
});