const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");

// router.get("/protected", requireLogin, (req, res) => {
//   res.send("Hi user");
// });

router.post("/signup", async (req, res) => {
  const { name, email, password, icon } = req.body;
  if (!email || !password || !name) {
    // console.log("Please add all the fields");
    return res.status(422).send({ error: "Please add all the fields" });
  }
  // console.log(req.body);
  await User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).send({ error: "Email already been used" });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = User.create({
          name,
          email,
          password: hashedpassword,
          icon,
        });

        user
          .then((user) => {
            res.json({ message: "Sign Up Successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please field in all the fields" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email or password" });
    }
    console.log(savedUser._id);
    bcrypt
      .compare(password, savedUser.password)
      .then((passwordMatch) => {
        if (passwordMatch) {
          // res.json({ message: "Login successfully" });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, email, name, icon } = savedUser;
          res.json({ token, user: { _id, email, name, icon } });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
