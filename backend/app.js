import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js"
import Transaction from "./models/Transaction.js";
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

mongoose.connect("mongodb://127.0.0.1:27017/FrugalFlow")
  .then(() => console.log("Connected to DB successfully"))
  .catch(err => console.error("Error while connecting to DB:", err));

app.get("/", (req, res) => {
  res.json("Server is running.");
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/otunar", passport.authenticate("google", {
    successRedirect: "http://localhost:5173/", 
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

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Not authenticated" });
};

app.get("/all-transactions", ensureAuth, async (req, res) => {

  try {
    const allTransaction = await Transaction.find({userId: req.user._id});
    console.log(allTransaction);
    res.json(allTransaction);

  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" }); 
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

app.post("/add-transaction", ensureAuth, async (req, res) => {
  try {
    const { type, category, amount, date, description } = req.body;

    const newTransaction = new Transaction({
      type: type, 
      category: category, 
      amount: amount, 
      date: date, 
      description: description, 
      userId: req.user._id
    });

    await newTransaction.save();

    res.status(201).json({ message: "Transaction received" });

  } catch (error) {
    console.error("Error saving transaction:", err);
    res.status(500).json({ message: "Failed to save transaction" });
  }
  
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

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});


app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}.`)
});
