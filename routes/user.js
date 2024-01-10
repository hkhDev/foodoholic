const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const requireLogin = require("../middleware/requireLogin");

router.get("/user/:id", requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name icon")
        .sort("-createdAt")
        .exec((err, posts) => {
          if (err) {
            return res.status(422).json({ error: err });
          }
          res.json({ user, posts });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User not found" });
    });
});

router.get("/myposts", requireLogin, (req, res) => {
  console.log("user");
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .sort("-createdAt")
    .then((myposts) => {
      res.json({ myposts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/searchuser", requireLogin, (req, res) => {
  console.log(req.body);
  let userPattern = new RegExp(req.body.searchText);
  User.find({ name: { $regex: userPattern, $options: "i" } })
    .select("-password")
    .then((user) => {
      res.json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/editprofilename", requireLogin, (req, res) => {
  console.log(req.body);
  User.findByIdAndUpdate(
    req.body._id,
    {
      name: req.body.name,
      icon: req.body.icon,
    },
    {
      new: true,
    }
  )
    // .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        const { _id, email, name, icon } = result;
        res.json({ user: { _id, email, name, icon } });
        console.log(result);
      }
    });
});

module.exports = router;
