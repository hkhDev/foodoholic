import React, { useState, useEffect, useContext } from "react";
// import { UserContext } from "../../App";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import Post from "../Post";
import { loadingEffect } from "../Home";

const UserProfile = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const { state, dispatch } = useContext(UserContext);
  const { userId } = useParams();
  // console.log(userId);
  useEffect(() => {
    getUserPost();
  }, []);

  const getUserPost = () => {
    console.log("called api");
    axios
      .get(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log("Get post");
        console.log(res.data);
        setUserPosts(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const renderPost = () => {
    // console.log(Array.isArray(userPosts.posts));
    // console.log(userPosts.posts.length);
    if (userPosts.posts && userPosts.posts.length > 0) {
      return userPosts.posts.map((post, index) => (
        <Post key={index} post={post} getPost={getUserPost} />
      ));
    } else {
      return <h2>No Post</h2>;
    }
  };
  return (
    <div>
      <h1>{userPosts.user && userPosts.user.name}</h1>
      {isLoading ? loadingEffect() : renderPost()}
    </div>
  );
  // (
  //
  //     <h1>{userPosts.user && userPosts.user.name}</h1>
  //     {renderPost()}
  //
  // );
};

export default UserProfile;
