const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    resName: {
      type: String,
      required: true,
    },
    resLocation: {
      type: String,
      required: true,
    },
    resFullAddress: {
      type: String,
      required: true,
    },
    resLocationLatLng: {
      type: Object,
      required: true,
    },
    resDetails: {
      type: [String],
      required: true,
    },
    resImgsDetail: [
      {
        imgUrl: { type: String, default: "no photo" },
        imgId: {
          type: String,
          required: true,
        },
      },
    ],
    likes: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: String,
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

mongoose.model("Post", postSchema); //if use export, may have error when you want to reuse the schema
